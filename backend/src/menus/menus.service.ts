
import { Ingredient } from '../entities/ingredient.entity';
import { GenerateMenuDto } from './dto/generate-menu.dto';
import { DietaryProfile } from '../entities/dietary-profile.entity';
import { AiService } from '../ai/ai.service';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu, MenuStatus } from '../entities/menu.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdateMenuStatusDto } from './dto/update-menu-status.dto';

@Injectable()
export class MenusService {
 constructor(
  @InjectRepository(Menu)
  private menuRepo: Repository<Menu>,
  @InjectRepository(MenuItem)
  private menuItemRepo: Repository<MenuItem>,
  @InjectRepository(DietaryProfile)
  private dietaryProfileRepo: Repository<DietaryProfile>,
  @InjectRepository(Ingredient)
  private ingredientRepo: Repository<Ingredient>,
  private aiService: AiService,
) {}

  async create(dto: CreateMenuDto, tenantId: string, userId: string) {
    const menu = this.menuRepo.create({
      weekStarting: dto.weekStarting,
      status: MenuStatus.DRAFT,
      createdByUserId: userId,
      tenantId,
      items: dto.items.map((item) => ({
        ...item,
        tenantId,
        nutritionSummary: this.calculateNutrition(item.ingredients),
      })) as any,
    });
    return this.menuRepo.save(menu);
  }

  async findAll(tenantId: string) {
    return this.menuRepo.find({ where: { tenantId }, relations: { items: true } });
  }

  async findOne(id: string, tenantId: string) {
    const menu = await this.menuRepo.findOne({
      where: { id, tenantId },
      relations: { items: true },
    });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async updateContent(id: string, dto: UpdateMenuDto, tenantId: string) {
    const menu = await this.findOne(id, tenantId);

    if (menu.status !== MenuStatus.DRAFT) {
      throw new BadRequestException(
        'Menu content can only be edited while in draft status',
      );
    }

    if (dto.items) {
      await this.menuItemRepo.delete({ menuId: id });
      const newItems = dto.items.map((item) => ({
        ...item,
        menuId: id,
        tenantId,
        nutritionSummary: this.calculateNutrition(item.ingredients),
      }));
      await this.menuItemRepo.save(newItems as any);
    }

    return this.findOne(id, tenantId);
  }
async updateStatus(id: string, dto: UpdateMenuStatusDto, tenantId: string, userRole: string) {
  const menu = await this.findOne(id, tenantId);

  const allowedTransitions: Record<MenuStatus, MenuStatus[]> = {
    [MenuStatus.DRAFT]: [MenuStatus.DIETITIAN_REVIEW],
    [MenuStatus.DIETITIAN_REVIEW]: [MenuStatus.APPROVED, MenuStatus.DRAFT],
    [MenuStatus.APPROVED]: [MenuStatus.PUBLISHED, MenuStatus.DIETITIAN_REVIEW],
    [MenuStatus.PUBLISHED]: [],
  };

  if (!allowedTransitions[menu.status].includes(dto.status)) {
    throw new BadRequestException(
      `Cannot move menu from '${menu.status}' to '${dto.status}'`,
    );
  }

  // Kaun konsa transition kar sakta hai — yahan enforce karo
  const transitionPermissions: Record<string, string[]> = {
    // 'draft->dietitian_review': Chef ya Admin kar sakte hain
    [`${MenuStatus.DRAFT}->${MenuStatus.DIETITIAN_REVIEW}`]: ['chef', 'admin'],
    // 'dietitian_review->approved' ya 'dietitian_review->draft': sirf Dietitian ya Admin
    [`${MenuStatus.DIETITIAN_REVIEW}->${MenuStatus.APPROVED}`]: ['dietitian', 'admin'],
    [`${MenuStatus.DIETITIAN_REVIEW}->${MenuStatus.DRAFT}`]: ['dietitian', 'admin'],
    // 'approved->published': Chef ya Admin (final release Chef karta hai, kyunki wahi kitchen se coordinate karta hai)
    [`${MenuStatus.APPROVED}->${MenuStatus.PUBLISHED}`]: ['chef', 'admin'],
    [`${MenuStatus.APPROVED}->${MenuStatus.DIETITIAN_REVIEW}`]: ['dietitian', 'admin'],
  };

  const transitionKey = `${menu.status}->${dto.status}`;
  const allowedRoles = transitionPermissions[transitionKey] || [];

  if (!allowedRoles.includes(userRole)) {
    throw new BadRequestException(
      `Your role (${userRole}) is not allowed to perform this transition`,
    );
  }

  menu.status = dto.status;
  return this.menuRepo.save(menu);
}  async remove(id: string, tenantId: string) {
    const menu = await this.findOne(id, tenantId);
    return this.menuRepo.remove(menu);
  }

// Generate weekly menu using AI or fallback template//
async generateWeeklyMenu(dto: GenerateMenuDto, tenantId: string, userId: string) {
  const availableIngredients = await this.ingredientRepo.find({ where: { tenantId } });
  const ingredientNames = availableIngredients.map((i) => i.name);

  let generatedItems: any[];
  let method: string;

  try {
    generatedItems = await this.generateMenuWithAI(dto, ingredientNames);
    method = 'ai';
  } catch (error) {
    console.warn('AI menu generation failed, using fallback template');
    generatedItems = this.generateMenuFallback(dto, availableIngredients);
    method = 'fallback';
  }

  // Draft menu save kardo, taake Chef review karke publish kar sake
  const menu = this.menuRepo.create({
    weekStarting: dto.weekStarting,
    status: MenuStatus.DRAFT,
    createdByUserId: userId,
    tenantId,
    items: generatedItems.map((item) => ({
      ...item,
      tenantId,
      nutritionSummary: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    })) as any,
  });

  const saved = await this.menuRepo.save(menu);
  return { menu: saved, generationMethod: method };
}

private async generateMenuWithAI(dto: GenerateMenuDto, availableIngredients: string[]) {
  const prompt = `
You are a catering menu planner. Generate a 7-day menu (breakfast, lunch, dinner for each day) using ONLY these available ingredients: ${availableIngredients.join(', ')}.

Constraints:
- Nutritional standard: ${dto.nutritionalStandard || 'standard'}
- Budget per meal: ${dto.budgetPerMeal || 'not specified'}
- Dietary notes: ${(dto.dietaryNotes || []).join(', ') || 'none'}

Respond ONLY with JSON in this exact shape:
{
  "items": [
    {
      "mealType": "breakfast" | "lunch" | "dinner",
      "dayOfWeek": 1-7,
      "dishName": "string",
      "ingredients": [{ "ingredientName": "string", "quantity": number, "unit": "string" }]
    }
  ]
}
Generate all 21 meals (7 days x 3 meals).
`;

  const result = await this.aiService.callLLMForJSON(prompt);
  if (!result.items || !Array.isArray(result.items)) {
    throw new Error('Invalid AI response shape');
  }

  return result.items.map((item: any) => ({
    mealType: item.mealType,
    dayOfWeek: item.dayOfWeek,
    dishName: item.dishName,
    ingredients: (item.ingredients || []).map((i: any) => ({
      ingredientId: '', // AI ko ingredient IDs nahi pata, Chef baad mein link karega
      ingredientName: i.ingredientName,
      quantity: i.quantity,
      unit: i.unit,
    })),
  }));
}

// Fallback — simple rotation template agar AI down ho
private generateMenuFallback(dto: GenerateMenuDto, ingredients: Ingredient[]) {
  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  const items: any[] = [];

  for (let day = 1; day <= 7; day++) {
    for (const mealType of mealTypes) {
      const randomIngredient = ingredients[Math.floor(Math.random() * ingredients.length)];
      items.push({
        mealType,
        dayOfWeek: day,
        dishName: `${mealType} special (Day ${day})`,
        ingredients: randomIngredient
          ? [
              {
                ingredientId: randomIngredient.id,
                ingredientName: randomIngredient.name,
                quantity: 100,
                unit: randomIngredient.unit,
              },
            ]
          : [],
      });
    }
  }

  return items;
}


// Check for allergy conflicts for a given menu item and cohort//
  async checkAllergyConflict(menuItemId: string, cohortId: string, tenantId: string) {
  const menuItem = await this.menuItemRepo.findOne({
    where: { id: menuItemId, tenantId },
  });
  if (!menuItem) {
    throw new NotFoundException('Menu item not found');
  }

  const profiles = await this.dietaryProfileRepo.find({
    where: { cohortId, tenantId },
  });

  const allAllergens = profiles.flatMap((p) =>
    p.allergies.map((a) => ({ allergen: a.allergen, severity: a.severity })),
  );

  if (allAllergens.length === 0) {
    return { conflicts: [], blocked: false, method: 'none-needed' };
  }

  const ingredientNames = menuItem.ingredients.map((i) => i.ingredientName);

  try {
    return await this.checkConflictWithAI(ingredientNames, allAllergens, menuItem.dishName);
  } catch (error) {
    console.warn('AI conflict check failed, using fallback rule-based check');
    return this.checkConflictFallback(ingredientNames, allAllergens);
  }
}

// AI wala tareeka — smarter matching (jaise "groundnut oil" = peanut allergy)
private async checkConflictWithAI(
  ingredients: string[],
  allergens: { allergen: string; severity: string }[],
  dishName: string,
) {
  const prompt = `
You are a food safety assistant. A dish called "${dishName}" contains these ingredients: ${ingredients.join(', ')}.

Check it against this list of allergens (with severity level for each): ${JSON.stringify(allergens)}.

For each ingredient that conflicts with an allergen (including indirect matches like "groundnut oil" containing peanut, or "whey" containing dairy), return a conflict entry.

Respond with JSON in this exact shape:
{
  "conflicts": [
    { "ingredient": "string", "allergen": "string", "severity": "mild|moderate|severe", "safeAlternative": "string" }
  ]
}
If there are no conflicts, return { "conflicts": [] }.
`;

  const result = await this.aiService.callLLMForJSON(prompt);
  const conflicts = result.conflicts || [];
  const blocked = conflicts.some((c: any) => c.severity === 'severe');

  return { conflicts, blocked, method: 'ai' };
}

// Fallback — simple keyword matching, AI down hone par ye chalega
private checkConflictFallback(
  ingredients: string[],
  allergens: { allergen: string; severity: string }[],
) {
  const conflicts: any[] = [];

  for (const ingredient of ingredients) {
    for (const a of allergens) {
      if (ingredient.toLowerCase().includes(a.allergen.toLowerCase())) {
        conflicts.push({
          ingredient,
          allergen: a.allergen,
          severity: a.severity,
          safeAlternative: 'Please consult dietitian for alternative',
        });
      }
    }
  }

  const blocked = conflicts.some((c) => c.severity === 'severe');
  return { conflicts, blocked, method: 'fallback' };
}

  private calculateNutrition(ingredients: any[]) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
}