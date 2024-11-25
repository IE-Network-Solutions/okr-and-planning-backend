import { Test, TestingModule } from '@nestjs/testing';
import { VpScoringService } from './vp-scoring.service';

describe('VpScoringService', () => {
  let service: VpScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VpScoringService],
    }).compile();

    service = module.get<VpScoringService>(VpScoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
