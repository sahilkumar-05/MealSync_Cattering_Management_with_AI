import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  name: string;

  @IsString()
  unit: string;

  @IsString()
  category: string;

  @IsObject()
  @IsOptional()
  nutritionPer100g?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  @IsNumber()
  @IsOptional()
  shelfLifeDays?: number;

  @IsString()
  @IsOptional()
  preferredSupplier?: string;

  @IsNumber()
  @IsOptional()
  stockLevel?: number;
}