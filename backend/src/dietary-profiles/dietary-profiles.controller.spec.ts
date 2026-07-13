import { Test, TestingModule } from '@nestjs/testing';
import { DietaryProfilesController } from './dietary-profiles.controller';

describe('DietaryProfilesController', () => {
  let controller: DietaryProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DietaryProfilesController],
    }).compile();

    controller = module.get<DietaryProfilesController>(DietaryProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
