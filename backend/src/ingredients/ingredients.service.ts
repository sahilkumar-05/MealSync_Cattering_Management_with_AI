import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepo: Repository<Ingredient>,
  ) {}

  async create(dto: CreateIngredientDto, tenantId: string) {
    const ingredient = this.ingredientRepo.create({ ...dto, tenantId });
    return this.ingredientRepo.save(ingredient);
  }

  async findAll(tenantId: string) {
    return this.ingredientRepo.find({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    const ingredient = await this.ingredientRepo.findOne({ where: { id, tenantId } });
    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }
    return ingredient;
  }

  async update(id: string, dto: UpdateIngredientDto, tenantId: string) {
    const ingredient = await this.findOne(id, tenantId); // ye khud check karega ke exist karta hai aur tenant match karta hai
    Object.assign(ingredient, dto);
    return this.ingredientRepo.save(ingredient);
  }

  async remove(id: string, tenantId: string) {
    const ingredient = await this.findOne(id, tenantId);
    return this.ingredientRepo.remove(ingredient);
  }
}