import { Test, TestingModule } from '@nestjs/testing';
import { VpScoringController } from './vp-scoring.controller';
import { VpScoringService } from './vp-scoring.service';

describe('VpScoringController', () => {
  let controller: VpScoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VpScoringController],
      providers: [VpScoringService],
    }).compile();

    controller = module.get<VpScoringController>(VpScoringController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
