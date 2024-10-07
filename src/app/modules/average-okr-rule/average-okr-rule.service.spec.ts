import { Test } from '@nestjs/testing';
import { AverageOkrRuleService } from './average-okr-rule.service';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { mock } from 'jest-mock-extended';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AverageOkrRule } from './entities/average-okr-rule.entity';

describe('AverageOkrRuleService', () => {
  let averageOkrRuleService: AverageOkrRuleService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AverageOkrRuleService,
        {
          provide: getRepositoryToken(AverageOkrRule),
          useValue: mock<Repository<AverageOkrRule>>(),
        },
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },
      ],
    }).compile();

    averageOkrRuleService = moduleRef.get<AverageOkrRuleService>(
      AverageOkrRuleService,
    );
  });

  it('should be defined', () => {
    expect(averageOkrRuleService).toBeDefined();
  });
});
