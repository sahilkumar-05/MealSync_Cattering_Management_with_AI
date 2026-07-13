import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateDietaryProfileDto {
  @IsString()
  dinerName: string;

  @IsString()
  @IsOptional()
  cohortId?: string;

  @IsArray()
  @IsOptional()
  allergies?: { allergen: string; severity: string }[];

  @IsArray()
  @IsOptional()
  religiousRequirements?: string[];

  @IsArray()
  @IsOptional()
  preferences?: string[];
}