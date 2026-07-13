import { PartialType } from '@nestjs/mapped-types';
import { CreateDietaryProfileDto } from './create-dietary-profile.dto';

export class UpdateDietaryProfileDto extends PartialType(CreateDietaryProfileDto) {}