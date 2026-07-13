import { Test, TestingModule } from '@nestjs/testing';
import { MealOrdersService } from './meal-orders.service';

describe('MealOrdersService', () => {
  let service: MealOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MealOrdersService],
    }).compile();

    service = module.get<MealOrdersService>(MealOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
