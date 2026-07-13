import { IsString, IsOptional } from 'class-validator';

export class CreateCohortDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}