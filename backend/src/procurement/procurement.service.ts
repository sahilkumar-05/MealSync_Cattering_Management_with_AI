import { AiService } from '../ai/ai.service';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementOrder, OrderStatus } from '../entities/procurement-order.entity';
import { PredictQuantityDto } from './dto/predict-quantity.dto';
import { Ingredient } from '../entities/ingredient.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

const LOW_STOCK_THRESHOLD = 10;

@Injectable()
export class ProcurementService {
  constructor(
  @InjectRepository(ProcurementOrder)
  private orderRepo: Repository<ProcurementOrder>,
  @InjectRepository(Ingredient)
  private ingredientRepo: Repository<Ingredient>,
  private notificationsGateway: NotificationsGateway,
  private aiService: AiService,
) {}

  async createOrder(dto: CreateOrderDto, tenantId: string, userId: string) {
    const ingredient = await this.ingredientRepo.findOne({
      where: { id: dto.ingredientId, tenantId },
    });
    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    const order = this.orderRepo.create({
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      quantity: dto.quantity,
      unit: ingredient.unit,
      supplier: dto.supplier || ingredient.preferredSupplier,
      status: OrderStatus.PENDING,
      orderedByUserId: userId,
      tenantId,
    });

    return this.orderRepo.save(order);
  }

  async findAll(tenantId: string) {
    return this.orderRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, tenantId: string) {
    const order = await this.orderRepo.findOne({ where: { id, tenantId } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrder(id: string, dto: UpdateOrderDto, tenantId: string) {
    const order = await this.findOne(id, tenantId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Order details can only be edited while status is pending',
      );
    }

    Object.assign(order, dto);
    return this.orderRepo.save(order);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, tenantId: string) {
    const order = await this.findOne(id, tenantId);

    if (order.status === OrderStatus.RECEIVED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot change status of a completed order');
    }

    order.status = dto.status;
    await this.orderRepo.save(order);

    if (dto.status === OrderStatus.RECEIVED) {
      const ingredient = await this.ingredientRepo.findOne({
        where: { id: order.ingredientId, tenantId },
      });
      if (ingredient) {
        ingredient.stockLevel += order.quantity;
        await this.ingredientRepo.save(ingredient);
        await this.checkAndNotifyLowStock(ingredient, tenantId);
      }
    }

    return order;
  }

  async checkAndNotifyLowStock(ingredient: Ingredient, tenantId: string) {
    if (ingredient.stockLevel < LOW_STOCK_THRESHOLD) {
      this.notificationsGateway.notifyLowStock(tenantId, ingredient);
    }
  }
  async predictQuantity(dto: PredictQuantityDto, tenantId: string) {
  const ingredient = await this.ingredientRepo.findOne({
    where: { id: dto.ingredientId, tenantId },
  });
  if (!ingredient) {
    throw new NotFoundException('Ingredient not found');
  }

  // Pichle 4 hafton ke orders nikaalo (consumption history ka proxy)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const recentOrders = await this.orderRepo
    .createQueryBuilder('order')
    .where('order.ingredientId = :ingredientId', { ingredientId: ingredient.id })
    .andWhere('order.tenantId = :tenantId', { tenantId })
    .andWhere('order.createdAt >= :fourWeeksAgo', { fourWeeksAgo })
    .getMany();

  try {
    return await this.predictWithAI(ingredient, recentOrders);
  } catch (error) {
    console.warn('AI prediction failed, using fallback average calculation');
    return this.predictFallback(ingredient, recentOrders);
  }
}

private async predictWithAI(ingredient: Ingredient, recentOrders: ProcurementOrder[]) {
  const orderHistory = recentOrders.map((o) => ({
    date: o.createdAt,
    quantity: o.quantity,
  }));

  const prompt = `
You are a procurement forecasting assistant. Here is the order history for "${ingredient.name}" over the last 4 weeks: ${JSON.stringify(orderHistory)}.
Current stock level: ${ingredient.stockLevel} ${ingredient.unit}.

Predict the quantity that should be ordered for next week. Consider trends (increasing/decreasing demand) if visible in the history.

Respond ONLY with JSON in this exact shape:
{
  "predictedQuantity": number,
  "confidenceLevel": "low" | "medium" | "high",
  "commentary": "short explanation string"
}
`;

  const result = await this.aiService.callLLMForJSON(prompt);
  if (typeof result.predictedQuantity !== 'number') {
    throw new Error('Invalid AI prediction response');
  }

  return { ...result, method: 'ai' };
}

// Fallback — simple average of past orders
private predictFallback(ingredient: Ingredient, recentOrders: ProcurementOrder[]) {
  if (recentOrders.length === 0) {
    return {
      predictedQuantity: 20, // koi history na ho to ek default reasonable amount
      confidenceLevel: 'low',
      commentary: 'No order history available; using default estimate.',
      method: 'fallback',
    };
  }

  const totalQuantity = recentOrders.reduce((sum, o) => sum + Number(o.quantity), 0);
  const average = totalQuantity / recentOrders.length;

  return {
    predictedQuantity: Math.round(average),
    confidenceLevel: 'medium',
    commentary: `Based on average of ${recentOrders.length} past order(s).`,
    method: 'fallback',
  };
}



  async getLowStockIngredients(tenantId: string) {
    const ingredients = await this.ingredientRepo.find({ where: { tenantId } });
    return ingredients.filter((i) => i.stockLevel < LOW_STOCK_THRESHOLD);
  }

  async remove(id: string, tenantId: string) {
    const order = await this.findOne(id, tenantId);
    return this.orderRepo.remove(order);
  }
}