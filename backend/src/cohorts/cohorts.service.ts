import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cohort } from '../entities/cohort.entity';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';

@Injectable()
export class CohortsService {
  constructor(
    @InjectRepository(Cohort)
    private cohortRepo: Repository<Cohort>,
  ) {}

  async create(dto: CreateCohortDto, tenantId: string) {
    const cohort = this.cohortRepo.create({ ...dto, tenantId });
    return this.cohortRepo.save(cohort);
  }

  async findAll(tenantId: string) {
    return this.cohortRepo.find({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    const cohort = await this.cohortRepo.findOne({ where: { id, tenantId } });
    if (!cohort) throw new NotFoundException('Cohort not found');
    return cohort;
  }

  async update(id: string, dto: UpdateCohortDto, tenantId: string) {
    const cohort = await this.findOne(id, tenantId);
    Object.assign(cohort, dto);
    return this.cohortRepo.save(cohort);
  }

  async remove(id: string, tenantId: string) {
    const cohort = await this.findOne(id, tenantId);
    return this.cohortRepo.remove(cohort);
  }
}