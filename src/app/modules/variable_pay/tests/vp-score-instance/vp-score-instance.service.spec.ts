import { Test, TestingModule } from '@nestjs/testing';
import { VpScoreInstanceService } from '../../services/vp-score-instance.service';

describe('VpScoreInstanceService', () => {
  let service: VpScoreInstanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VpScoreInstanceService],
    }).compile();

    service = module.get<VpScoreInstanceService>(VpScoreInstanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
