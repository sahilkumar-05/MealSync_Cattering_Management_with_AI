import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  ingredientId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  supplier?: string;
}