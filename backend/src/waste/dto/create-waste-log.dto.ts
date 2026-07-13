import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateWasteLogDto {
  @IsString()
  menuItemId: string;

  @IsString()
  dishName: string;

  @IsDateString()
  logDate: string;

  @IsNumber()
  wastedKg: number;

  @IsString()
  @IsOptional()
  notes?: string;
}