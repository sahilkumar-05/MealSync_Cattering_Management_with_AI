import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { Menu } from '../entities/menu.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { DietaryProfile } from '../entities/dietary-profile.entity';
import { Ingredient } from '../entities/ingredient.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, MenuItem, DietaryProfile, Ingredient]),
    AiModule,
  ],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}