import { Test, TestingModule } from '@nestjs/testing';
import { VpCriteriaService } from './vp-criteria.service';

describe('VpCriteriaService', () => {
  let service: VpCriteriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VpCriteriaService],
    }).compile();

    service = module.get<VpCriteriaService>(VpCriteriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
