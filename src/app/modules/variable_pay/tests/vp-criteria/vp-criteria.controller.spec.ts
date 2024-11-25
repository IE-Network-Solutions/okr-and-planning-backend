import { Test, TestingModule } from '@nestjs/testing';
import { VpCriteriaController } from './vp-criteria.controller';
import { VpCriteriaService } from './vp-criteria.service';

describe('VpCriteriaController', () => {
  let controller: VpCriteriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VpCriteriaController],
      providers: [VpCriteriaService],
    }).compile();

    controller = module.get<VpCriteriaController>(VpCriteriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
