import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealOrder, MealOrderStatus } from '../entities/meal-order.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { CreateMealOrderDto } from './dto/create-meal-order.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

const STUDENT_ORDER_CUTOFF_HOUR = 22; // 10 PM

@Injectable()
export class MealOrdersService {
  constructor(
  @InjectRepository(MealOrder)
  private orderRepo: Repository<MealOrder>,
  @InjectRepository(MenuItem)
  private menuItemRepo: Repository<MenuItem>,
  private notificationsGateway: NotificationsGateway,
) {}

  // Student self-order — cutoff check hota hai
  async placeStudentOrder(dto: CreateMealOrderDto, tenantId: string, userId: string) {
    const now = new Date();
    if (now.getHours() >= STUDENT_ORDER_CUTOFF_HOUR) {
      throw new BadRequestException(
        `Orders for tomorrow must be placed before ${STUDENT_ORDER_CUTOFF_HOUR}:00 (10 PM)`,
      );
    }

    return this.createOrder(dto, tenantId, userId, 1); // student ka order hamesha quantity 1
  }

  // Nurse ward order — koi cutoff nahi, lekin quantity bhej sakti hai
  async placeWardOrder(dto: CreateMealOrderDto, tenantId: string, userId: string) {
    return this.createOrder(dto, tenantId, userId, dto.quantity || 1);
  }

 private async createOrder(
  dto: CreateMealOrderDto,
  tenantId: string,
  userId: string,
  quantity: number,
) {
  const menuItem = await this.menuItemRepo.findOne({
    where: { id: dto.menuItemId, tenantId },
  });
  if (!menuItem) {
    throw new NotFoundException('Menu item not found');
  }

  const order = this.orderRepo.create({
    menuItemId: dto.menuItemId,
    dishName: menuItem.dishName,
    serviceDate: dto.serviceDate,
    cohortId: dto.cohortId,
    dinerName: dto.dinerName,
    quantity,
    status: MealOrderStatus.PLACED,
    placedByUserId: userId,
    tenantId,
  });

  const saved = await this.orderRepo.save(order);

  // Chef/kitchen staff ko real-time notify karo naya order aane par
  this.notificationsGateway.notifyNewOrder(tenantId, {
    message: `New order: ${quantity}x ${menuItem.dishName} for ${dto.serviceDate}`,
    order: saved,
  });

  return saved;
}

  async findAll(
    tenantId: string,
    serviceDate?: string,
    userRole?: string,
    userId?: string,
  ) {
    const where: any = { tenantId };
    if (serviceDate) where.serviceDate = serviceDate;

    // Student aur Nurse ko sirf apne khud ke placed orders dikhne chahiye,
    // baaki roles (chef/admin/dietitian/procurement) ko tenant ke sab orders dikhte hain
    // toLowerCase() se case-mismatch (e.g. enum 'STUDENT' vs 'student') se bacha ja raha hai
    const normalizedRole = userRole?.toLowerCase();
    if ((normalizedRole === 'student' || normalizedRole === 'nurse') && userId) {
      where.placedByUserId = userId;
    }

    return this.orderRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, tenantId: string) {
    const order = await this.orderRepo.findOne({ where: { id, tenantId } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async cancelOrder(id: string, tenantId: string) {
    const order = await this.findOne(id, tenantId);
    if (order.status === MealOrderStatus.FINALIZED) {
      throw new BadRequestException('Cannot cancel a finalized order');
    }
    order.status = MealOrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }

  // Ye kitchen ke liye chalta hai — ek din/dish ke sab orders "final" kar deta hai
  // aur WebSocket se Chef ko batata hai "counts final hain, khana banana shuru karo"
  async finalizeOrdersForDate(serviceDate: string, tenantId: string) {
    const orders = await this.orderRepo.find({
      where: { serviceDate, tenantId, status: MealOrderStatus.PLACED },
    });

    for (const order of orders) {
      order.status = MealOrderStatus.FINALIZED;
    }
    await this.orderRepo.save(orders);

    const totalsByDish: Record<string, number> = {};
    for (const order of orders) {
      totalsByDish[order.dishName] = (totalsByDish[order.dishName] || 0) + order.quantity;
    }

    // Kitchen ko real-time notify karo
    this.notificationsGateway.notifyOrderCountFinal(tenantId, {
      serviceDate,
      totalsByDish,
    });

    return { serviceDate, totalOrders: orders.length, totalsByDish };
  }
}