import { IsString } from 'class-validator';

export class CheckAllergyConflictDto {
  @IsString()
  menuItemId: string;

  @IsString()
  cohortId: string;
}