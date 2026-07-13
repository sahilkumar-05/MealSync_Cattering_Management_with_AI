import { Test, TestingModule } from '@nestjs/testing';
import { CohortsController } from './cohorts.controller';

describe('CohortsController', () => {
  let controller: CohortsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CohortsController],
    }).compile();

    controller = module.get<CohortsController>(CohortsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
