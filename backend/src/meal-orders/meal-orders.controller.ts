import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MealOrdersService } from './meal-orders.service';
import { CreateMealOrderDto } from './dto/create-meal-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMatchGuard } from '../auth/tenant-match.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('meal-orders')
@UseGuards(JwtAuthGuard, TenantMatchGuard, RolesGuard)
export class MealOrdersController {
  constructor(private readonly mealOrdersService: MealOrdersService) {}

  @Post('student')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  placeStudentOrder(@Body() dto: CreateMealOrderDto, @Req() req) {
    return this.mealOrdersService.placeStudentOrder(dto, req.user.tenantId, req.user.userId);
  }

  @Post('ward')
  @Roles(UserRole.NURSE, UserRole.ADMIN)
  placeWardOrder(@Body() dto: CreateMealOrderDto, @Req() req) {
    return this.mealOrdersService.placeWardOrder(dto, req.user.tenantId, req.user.userId);
  }

  @Get()
  @Roles(
    UserRole.CHEF,
    UserRole.DIETITIAN,
    UserRole.PROCUREMENT_OFFICER,
    UserRole.ADMIN,
    UserRole.NURSE,
    UserRole.STUDENT,
  )
  findAll(@Query('serviceDate') serviceDate: string, @Req() req) {
    return this.mealOrdersService.findAll(
      req.user.tenantId,
      serviceDate,
      req.user.role,
      req.user.userId,
    );
  }

  @Get(':id')
  @Roles(
    UserRole.CHEF,
    UserRole.DIETITIAN,
    UserRole.PROCUREMENT_OFFICER,
    UserRole.ADMIN,
    UserRole.NURSE,
    UserRole.STUDENT,
  )
  findOne(@Param('id') id: string, @Req() req) {
    return this.mealOrdersService.findOne(id, req.user.tenantId);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.NURSE, UserRole.STUDENT, UserRole.CHEF)
  cancelOrder(@Param('id') id: string, @Req() req) {
    return this.mealOrdersService.cancelOrder(id, req.user.tenantId);
  }

  @Post('finalize')
  @Roles(UserRole.CHEF, UserRole.ADMIN)
  finalizeOrders(@Body('serviceDate') serviceDate: string, @Req() req) {
    return this.mealOrdersService.finalizeOrdersForDate(serviceDate, req.user.tenantId);
  }
}