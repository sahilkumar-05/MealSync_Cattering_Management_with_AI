import { Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WasteLog } from '../entities/waste-log.entity';
import { CreateWasteLogDto } from './dto/create-waste-log.dto';

@Injectable()
export class WasteService {
  constructor(
  @InjectRepository(WasteLog)
  private wasteRepo: Repository<WasteLog>,
  private aiService: AiService,
) {}

  async create(dto: CreateWasteLogDto, tenantId: string, userId: string) {
    const log = this.wasteRepo.create({ ...dto, loggedByUserId: userId, tenantId });
    return this.wasteRepo.save(log);
  }

  async findAll(tenantId: string) {
    return this.wasteRepo.find({ where: { tenantId }, order: { logDate: 'DESC' } });
  }
async analyseRootCause(tenantId: string) {
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const logs = await this.wasteRepo
    .createQueryBuilder('log')
    .where('log.tenantId = :tenantId', { tenantId })
    .andWhere('log.createdAt >= :fourWeeksAgo', { fourWeeksAgo })
    .getMany();

  if (logs.length === 0) {
    return {
      topWastedDishes: [],
      recommendations: ['Not enough waste data logged yet to generate insights.'],
      method: 'none',
    };
  }

  try {
    return await this.analyseWithAI(logs);
  } catch (error) {
    console.warn('AI waste analysis failed, using fallback summary');
    return this.analyseFallback(logs);
  }
}

private async analyseWithAI(logs: WasteLog[]) {
  const summary = logs.map((l) => ({
    dish: l.dishName,
    date: l.logDate,
    wastedKg: l.wastedKg,
    notes: l.notes || '',
  }));

  const prompt = `
You are a food-waste analyst for a catering service. Here is 4 weeks of waste log data: ${JSON.stringify(summary)}.

Identify the top 5 most-wasted dishes, likely causes based on any patterns or notes, and give 3 concrete recommendations to reduce waste.

Respond ONLY with JSON in this exact shape:
{
  "topWastedDishes": [{ "dishName": "string", "totalWastedKg": number, "likelyCause": "string" }],
  "recommendations": ["string", "string", "string"]
}
`;

  const result = await this.aiService.callLLMForJSON(prompt);
  return { ...result, method: 'ai' };
}

// Fallback — sirf numbers ka simple summary, koi "cause" guess nahi karta
private analyseFallback(logs: WasteLog[]) {
  const grouped: Record<string, number> = {};
  for (const log of logs) {
    grouped[log.dishName] = (grouped[log.dishName] || 0) + Number(log.wastedKg);
  }

  const topWastedDishes = Object.entries(grouped)
    .map(([dishName, totalWastedKg]) => ({
      dishName,
      totalWastedKg,
      likelyCause: 'Not available without AI analysis',
    }))
    .sort((a, b) => b.totalWastedKg - a.totalWastedKg)
    .slice(0, 5);

  return {
    topWastedDishes,
    recommendations: [
      'Review portion sizes for the highest-waste dishes listed above.',
      'Cross-check waste patterns against attendance/order counts for those days.',
      'Consider reducing production quantity for consistently high-waste items.',
    ],
    method: 'fallback',
  };
}
  async findOne(id: string, tenantId: string) {
    const log = await this.wasteRepo.findOne({ where: { id, tenantId } });
    if (!log) throw new NotFoundException('Waste log not found');
    return log;
  }

  // Analytics: total waste, dish ke hisaab se
  async getWasteByDish(tenantId: string) {
    const logs = await this.wasteRepo.find({ where: { tenantId } });
    const grouped: Record<string, number> = {};

    for (const log of logs) {
      grouped[log.dishName] = (grouped[log.dishName] || 0) + Number(log.wastedKg);
    }

    return Object.entries(grouped).map(([dishName, totalWastedKg]) => ({
      dishName,
      totalWastedKg,
    }));
  }

  // Analytics: din ke hisaab se
  async getWasteByDay(tenantId: string) {
    const logs = await this.wasteRepo.find({ where: { tenantId } });
    const grouped: Record<string, number> = {};

    for (const log of logs) {
      grouped[log.logDate] = (grouped[log.logDate] || 0) + Number(log.wastedKg);
    }

    return Object.entries(grouped).map(([date, totalWastedKg]) => ({
      date,
      totalWastedKg,
    }));
  }

  async remove(id: string, tenantId: string) {
    const log = await this.findOne(id, tenantId);
    return this.wasteRepo.remove(log);
  }
}