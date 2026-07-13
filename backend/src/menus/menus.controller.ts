import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CheckAllergyConflictDto } from './dto/check-allergy-conflict.dto';
import { AiService } from '../ai/ai.service';
import { GenerateMenuDto } from './dto/generate-menu.dto';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdateMenuStatusDto } from './dto/update-menu-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMatchGuard } from '../auth/tenant-match.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

import { ApiTags,ApiBearerAuth, ApiHeader  } from '@nestjs/swagger';

@ApiTags('menus')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@Controller('menus')
@UseGuards(JwtAuthGuard, TenantMatchGuard, RolesGuard)
export class MenusController {
  constructor(
  private readonly menusService: MenusService,
  private readonly aiService: AiService,
) {}

  @Post()
  @Roles(UserRole.CHEF, UserRole.ADMIN)
  create(@Body() dto: CreateMenuDto, @Req() req) {
    return this.menusService.create(dto, req.user.tenantId, req.user.userId);
  }

@Get()
@Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN, UserRole.NURSE, UserRole.STUDENT)
findAll(@Req() req) {
  return this.menusService.findAll(req.user.tenantId);
}
@Post('generate')
@Roles(UserRole.CHEF, UserRole.ADMIN)
generateMenu(@Body() dto: GenerateMenuDto, @Req() req) {
  return this.menusService.generateWeeklyMenu(dto, req.user.tenantId, req.user.userId);
}

  //testing AI integration//
// @Get('ai-test/ping')
// async testAi() {
//   const response = await this.aiService.callLLM('Say hello in one short sentence');
//   return { response };
// }
@Post('check-allergy-conflict')
@Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.ADMIN)
checkAllergyConflict(@Body() dto: CheckAllergyConflictDto, @Req() req) {
  return this.menusService.checkAllergyConflict(
    dto.menuItemId,
    dto.cohortId,
    req.user.tenantId,
  );
}


@Get(':id')
@Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN, UserRole.NURSE, UserRole.STUDENT)
findOne(@Param('id') id: string, @Req() req) {
  return this.menusService.findOne(id, req.user.tenantId);
}

  // Dishes/content edit karne ke liye
  @Put(':id')
  @Roles(UserRole.CHEF, UserRole.ADMIN)
  updateContent(@Param('id') id: string, @Body() dto: UpdateMenuDto, @Req() req) {
    return this.menusService.updateContent(id, dto, req.user.tenantId);
  }

  // Sirf status move karne ke liye
  @Patch(':id/status')
@Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.ADMIN)
updateStatus(@Param('id') id: string, @Body() dto: UpdateMenuStatusDto, @Req() req) {
  return this.menusService.updateStatus(id, dto, req.user.tenantId, req.user.role);
}

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req) {
    return this.menusService.remove(id, req.user.tenantId);
  }
}