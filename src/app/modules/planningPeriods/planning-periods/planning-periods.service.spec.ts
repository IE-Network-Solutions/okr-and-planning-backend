import { Test, TestingModule } from '@nestjs/testing';
import { PlanningPeriodsService } from './planning-periods.service';

describe('PlanningPeriodsService', () => {
  let service: PlanningPeriodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanningPeriodsService],
    }).compile();

    service = module.get<PlanningPeriodsService>(PlanningPeriodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
