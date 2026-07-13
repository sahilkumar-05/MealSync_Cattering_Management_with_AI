import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CohortsService } from './cohorts.service';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMatchGuard } from '../auth/tenant-match.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

import { ApiTags,ApiBearerAuth ,ApiHeader  } from '@nestjs/swagger';

@ApiTags('cohorts')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@Controller('cohorts')
@UseGuards(JwtAuthGuard, TenantMatchGuard, RolesGuard)
export class CohortsController {
  constructor(private readonly cohortsService: CohortsService) {}

  @Post()
  @Roles(UserRole.DIETITIAN, UserRole.ADMIN)
  create(@Body() dto: CreateCohortDto, @Req() req) {
    return this.cohortsService.create(dto, req.user.tenantId);
  }

  @Get()
@Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN, UserRole.NURSE, UserRole.STUDENT)
findAll(@Req() req) {
  return this.cohortsService.findAll(req.user.tenantId);
}

 
@Get(':id')
@Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN, UserRole.NURSE, UserRole.STUDENT)
findOne(@Param('id') id: string, @Req() req) {
  return this.cohortsService.findOne(id, req.user.tenantId);
}

  @Put(':id')
  @Roles(UserRole.DIETITIAN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCohortDto, @Req() req) {
    return this.cohortsService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req) {
    return this.cohortsService.remove(id, req.user.tenantId);
  }
}