import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { ProcurementOrder } from '../entities/procurement-order.entity';
import { Ingredient } from '../entities/ingredient.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProcurementOrder, Ingredient]),
    NotificationsModule,
    AiModule,
  ],
  controllers: [ProcurementController],
  providers: [ProcurementService],
})
export class ProcurementModule {}