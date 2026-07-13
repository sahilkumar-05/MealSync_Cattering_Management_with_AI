import { Test, TestingModule } from '@nestjs/testing';
import { MealOrdersController } from './meal-orders.controller';

describe('MealOrdersController', () => {
  let controller: MealOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealOrdersController],
    }).compile();

    controller = module.get<MealOrdersController>(MealOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
