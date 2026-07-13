import { IsString } from 'class-validator';

export class PredictQuantityDto {
  @IsString()
  ingredientId: string;
}