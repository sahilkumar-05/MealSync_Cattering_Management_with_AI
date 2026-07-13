import { IsString, IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateMealOrderDto { 
  @IsString()
  menuItemId: string;

  @IsDateString()
  serviceDate: string;

  @IsString()
  cohortId: string;

  @IsString()
  @IsOptional()
  dinerName?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
