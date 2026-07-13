import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  supplier?: string;
}