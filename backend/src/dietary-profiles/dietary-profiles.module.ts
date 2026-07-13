import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DietaryProfilesService } from './dietary-profiles.service';
import { DietaryProfilesController } from './dietary-profiles.controller';
import { DietaryProfile } from '../entities/dietary-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DietaryProfile])],
  controllers: [DietaryProfilesController],
  providers: [DietaryProfilesService],
})
export class DietaryProfilesModule {}