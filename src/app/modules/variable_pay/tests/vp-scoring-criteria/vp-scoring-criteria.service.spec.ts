import { Test, TestingModule } from '@nestjs/testing';
import { VpScoringCriteriaService } from './vp-scoring-criteria.service';

describe('VpScoringCriteriaService', () => {
  let service: VpScoringCriteriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VpScoringCriteriaService],
    }).compile();

    service = module.get<VpScoringCriteriaService>(VpScoringCriteriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
