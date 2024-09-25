import { Test, TestingModule } from '@nestjs/testing';
import { AverageOkrRuleController } from './average-okr-rule.controller';
import { AverageOkrRuleService } from './average-okr-rule.service';

describe('AverageOkrRuleController', () => {
  let controller: AverageOkrRuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AverageOkrRuleController],
      providers: [AverageOkrRuleService],
    }).compile();

    controller = module.get<AverageOkrRuleController>(AverageOkrRuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
