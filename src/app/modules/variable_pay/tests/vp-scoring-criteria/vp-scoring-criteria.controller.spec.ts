import { Test, TestingModule } from '@nestjs/testing';
import { VpScoringCriteriaController } from './vp-scoring-criteria.controller';
import { VpScoringCriteriaService } from './vp-scoring-criteria.service';

describe('VpScoringCriteriaController', () => {
  let controller: VpScoringCriteriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VpScoringCriteriaController],
      providers: [VpScoringCriteriaService],
    }).compile();

    controller = module.get<VpScoringCriteriaController>(VpScoringCriteriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
