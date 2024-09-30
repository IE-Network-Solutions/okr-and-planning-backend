import { Test, TestingModule } from '@nestjs/testing';
import { AverageOkrRuleService } from './average-okr-rule.service';

describe('AverageOkrRuleService', () => {
  let service: AverageOkrRuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AverageOkrRuleService],
    }).compile();

    service = module.get<AverageOkrRuleService>(AverageOkrRuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
