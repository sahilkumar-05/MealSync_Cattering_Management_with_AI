import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WasteService } from './waste.service';
import { CreateWasteLogDto } from './dto/create-waste-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMatchGuard } from '../auth/tenant-match.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

import { ApiTags,ApiBearerAuth, ApiHeader  } from '@nestjs/swagger';

@ApiTags('waste')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@Controller('waste')
@UseGuards(JwtAuthGuard, TenantMatchGuard, RolesGuard)
export class WasteController {
  constructor(private readonly wasteService: WasteService) {}

  @Post()
  @Roles(UserRole.CHEF, UserRole.ADMIN)
  create(@Body() dto: CreateWasteLogDto, @Req() req) {
    return this.wasteService.create(dto, req.user.tenantId, req.user.userId);
  }

  @Get()
  @Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.ADMIN)
  findAll(@Req() req) {
    return this.wasteService.findAll(req.user.tenantId);
  }

  @Get('analytics/by-dish')
  @Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.ADMIN)
  wasteByDish(@Req() req) {
    return this.wasteService.getWasteByDish(req.user.tenantId);
  }

  @Get('analytics/by-day')
  @Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.ADMIN)
  wasteByDay(@Req() req) {
    return this.wasteService.getWasteByDay(req.user.tenantId);
  }
@Get('analytics/root-cause')
@Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.ADMIN)
rootCauseAnalysis(@Req() req) {
  return this.wasteService.analyseRootCause(req.user.tenantId);
}
  @Get(':id')
  @Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.ADMIN)
  findOne(@Param('id') id: string, @Req() req) {
    return this.wasteService.findOne(id, req.user.tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req) {
    return this.wasteService.remove(id, req.user.tenantId);
  }
}