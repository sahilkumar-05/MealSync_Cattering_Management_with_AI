import { IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMenuItemDto } from './create-menu-item.dto';

export class CreateMenuDto {
  @IsDateString()
  weekStarting: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMenuItemDto)
  items: CreateMenuItemDto[];
}