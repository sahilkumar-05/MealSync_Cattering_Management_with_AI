import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WasteService } from './waste.service';
import { WasteController } from './waste.controller';
import { WasteLog } from '../entities/waste-log.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([WasteLog]), AiModule],
  controllers: [WasteController],
  providers: [WasteService],
})
export class WasteModule {}