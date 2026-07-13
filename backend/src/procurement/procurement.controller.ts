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
import { PredictQuantityDto } from './dto/predict-quantity.dto';
import { ProcurementService } from './procurement.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMatchGuard } from '../auth/tenant-match.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

import { ApiTags,ApiBearerAuth, ApiHeader  } from '@nestjs/swagger';

@ApiTags('procurement')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@Controller('procurement')
@UseGuards(JwtAuthGuard, TenantMatchGuard, RolesGuard)
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post('orders')
  @Roles(UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN)
  createOrder(@Body() dto: CreateOrderDto, @Req() req) {
    return this.procurementService.createOrder(dto, req.user.tenantId, req.user.userId);
  }

  @Get('orders')
  @Roles(UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN)
  findAll(@Req() req) {
    return this.procurementService.findAll(req.user.tenantId);
  }
  

  @Get('orders/:id')
  @Roles(UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN)
  findOne(@Param('id') id: string, @Req() req) {
    return this.procurementService.findOne(id, req.user.tenantId);
  }

  // Content (quantity/supplier) update karne ke liye
  @Put('orders/:id')
  @Roles(UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN)
  updateOrder(@Param('id') id: string, @Body() dto: UpdateOrderDto, @Req() req) {
    return this.procurementService.updateOrder(id, dto, req.user.tenantId);
  }
  @Post('predict-quantity')
@Roles(UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN)
predictQuantity(@Body() dto: PredictQuantityDto, @Req() req) {
  return this.procurementService.predictQuantity(dto, req.user.tenantId);
}

  // Sirf status move karne ke liye
  @Patch('orders/:id/status')
  @Roles(UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @Req() req) {
    return this.procurementService.updateStatus(id, dto, req.user.tenantId);
  }

  @Get('low-stock')
  @Roles(UserRole.CHEF, UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN)
  getLowStock(@Req() req) {
    return this.procurementService.getLowStockIngredients(req.user.tenantId);
  }

  @Delete('orders/:id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req) {
    return this.procurementService.remove(id, req.user.tenantId);
  }
}