import { IsDateString, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class GenerateMenuDto {
  @IsDateString()
  weekStarting: string;

  @IsNumber()
  @IsOptional()
  budgetPerMeal?: number; // e.g. 150 (currency unit tumhari marzi)

  @IsString()
  @IsOptional()
  nutritionalStandard?: string; // e.g. "NHS", "student", "standard"

  @IsArray()
  @IsOptional()
  dietaryNotes?: string[]; // e.g. ["35% vegetarian", "no beef"]
}