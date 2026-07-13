import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DietaryProfilesService } from './dietary-profiles.service';
import { CreateDietaryProfileDto } from './dto/create-dietary-profile.dto';
import { UpdateDietaryProfileDto } from './dto/update-dietary-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMatchGuard } from '../auth/tenant-match.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

import { ApiTags,ApiBearerAuth, ApiHeader  } from '@nestjs/swagger';

@ApiTags('dietary-profiles')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@Controller('dietary-profiles')
@UseGuards(JwtAuthGuard, TenantMatchGuard, RolesGuard)
export class DietaryProfilesController {
  constructor(private readonly profilesService: DietaryProfilesService) {}

  @Post()
  @Roles(UserRole.DIETITIAN, UserRole.ADMIN)
  create(@Body() dto: CreateDietaryProfileDto, @Req() req) {
    return this.profilesService.create(dto, req.user.tenantId);
  }

  @Get()
  @Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.ADMIN)
  findAll(@Query('cohortId') cohortId: string, @Req() req) {
    if (cohortId) {
      return this.profilesService.findByCohort(cohortId, req.user.tenantId);
    }
    return this.profilesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.ADMIN)
  findOne(@Param('id') id: string, @Req() req) {
    return this.profilesService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @Roles(UserRole.DIETITIAN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateDietaryProfileDto, @Req() req) {
    return this.profilesService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.DIETITIAN, UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req) {
    return this.profilesService.remove(id, req.user.tenantId);
  }
}