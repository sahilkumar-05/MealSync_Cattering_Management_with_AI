import { Test, TestingModule } from '@nestjs/testing';
import { DietaryProfilesService } from './dietary-profiles.service';

describe('DietaryProfilesService', () => {
  let service: DietaryProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DietaryProfilesService],
    }).compile();

    service = module.get<DietaryProfilesService>(DietaryProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
