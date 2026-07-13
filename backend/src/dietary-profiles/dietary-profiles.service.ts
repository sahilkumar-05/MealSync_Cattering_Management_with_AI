import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DietaryProfile } from '../entities/dietary-profile.entity';
import { CreateDietaryProfileDto } from './dto/create-dietary-profile.dto';
import { UpdateDietaryProfileDto } from './dto/update-dietary-profile.dto';

@Injectable()
export class DietaryProfilesService {
  constructor(
    @InjectRepository(DietaryProfile)
    private profileRepo: Repository<DietaryProfile>,
  ) {}

  async create(dto: CreateDietaryProfileDto, tenantId: string) {
    const profile = this.profileRepo.create({ ...dto, tenantId } as any);
    return this.profileRepo.save(profile);
  }

  async findAll(tenantId: string) {
    return this.profileRepo.find({ where: { tenantId } });
  }

  async findByCohort(cohortId: string, tenantId: string) {
    return this.profileRepo.find({ where: { cohortId, tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    const profile = await this.profileRepo.findOne({ where: { id, tenantId } });
    if (!profile) throw new NotFoundException('Dietary profile not found');
    return profile;
  }

  async update(id: string, dto: UpdateDietaryProfileDto, tenantId: string) {
    const profile = await this.findOne(id, tenantId);
    Object.assign(profile, dto);
    return this.profileRepo.save(profile);
  }

  async remove(id: string, tenantId: string) {
    const profile = await this.findOne(id, tenantId);
    return this.profileRepo.remove(profile);
  }
}