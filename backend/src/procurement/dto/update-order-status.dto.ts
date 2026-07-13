import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../entities/procurement-order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}