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
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMatchGuard } from '../auth/tenant-match.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ApiTags,ApiBearerAuth, ApiHeader  } from '@nestjs/swagger';

@ApiTags('ingredients')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@Controller('ingredients')
@UseGuards(JwtAuthGuard, TenantMatchGuard, RolesGuard) // saare routes pe ye 3 guards lagenge
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @Roles(UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN)
  create(@Body() dto: CreateIngredientDto, @Req() req) {
    return this.ingredientsService.create(dto, req.user.tenantId);
  }

  @Get()
  @Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN)
  findAll(@Req() req) {
    return this.ingredientsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.CHEF, UserRole.DIETITIAN, UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN)
  findOne(@Param('id') id: string, @Req() req) {
    return this.ingredientsService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @Roles(UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateIngredientDto, @Req() req) {
    return this.ingredientsService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req) {
    return this.ingredientsService.remove(id, req.user.tenantId);
  }
}