import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMenuItemDto } from './create-menu-item.dto';

export class UpdateMenuDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMenuItemDto)
  @IsOptional()
  items?: CreateMenuItemDto[];
}