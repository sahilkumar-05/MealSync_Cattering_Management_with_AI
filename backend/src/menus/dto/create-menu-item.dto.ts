import { IsString, IsEnum, IsInt, IsArray } from 'class-validator';
import { MealType } from '../../entities/menu-item.entity';

export class MenuItemIngredientDto {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export class CreateMenuItemDto {
  @IsEnum(MealType)
  mealType: MealType;

  @IsInt()
  dayOfWeek: number;

  @IsString()
  dishName: string;

  @IsArray()
  ingredients: MenuItemIngredientDto[];
}