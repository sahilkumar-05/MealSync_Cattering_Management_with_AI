import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealOrdersService } from './meal-orders.service';
import { MealOrdersController } from './meal-orders.controller';
import { MealOrder } from '../entities/meal-order.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealOrder, MenuItem]),
    NotificationsModule,
  ],
  controllers: [MealOrdersController],
  providers: [MealOrdersService],
})
export class MealOrdersModule {}