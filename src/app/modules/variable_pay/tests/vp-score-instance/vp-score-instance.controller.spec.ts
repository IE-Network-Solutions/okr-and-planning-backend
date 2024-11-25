import { Test, TestingModule } from '@nestjs/testing';
import { VpScoreInstanceController } from './vp-score-instance.controller';
import { VpScoreInstanceService } from '../../services/vp-score-instance.service';

describe('VpScoreInstanceController', () => {
  let controller: VpScoreInstanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VpScoreInstanceController],
      providers: [VpScoreInstanceService],
    }).compile();

    controller = module.get<VpScoreInstanceController>(VpScoreInstanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
