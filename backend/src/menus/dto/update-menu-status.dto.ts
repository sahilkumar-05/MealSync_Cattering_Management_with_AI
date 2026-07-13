import { IsEnum } from 'class-validator';
import { MenuStatus } from '../../entities/menu.entity';

export class UpdateMenuStatusDto {
  @IsEnum(MenuStatus)
  status: MenuStatus;
}