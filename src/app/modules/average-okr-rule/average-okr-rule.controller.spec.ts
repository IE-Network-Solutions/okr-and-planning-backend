import { Test } from '@nestjs/testing';
import { AverageOkrRuleController } from './average-okr-rule.controller';
import { AverageOkrRuleService } from './average-okr-rule.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AverageOkrRule } from './entities/average-okr-rule.entity';
import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';

describe('AverageOkrRuleController', () => {
  let averageOkrRuleController: AverageOkrRuleController;
  let averageOkrRuleService: AverageOkrRuleService;
  let averageOkrRuleRepository: Repository<AverageOkrRule>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AverageOkrRuleController],
      providers: [
        AverageOkrRuleService,
        {
          provide: getRepositoryToken(AverageOkrRule),
          useClass: Repository,
        },
        {
          provide: PaginationService,
          useValue: {
            paginate: jest.fn(),
          },
        },
      ],
    }).compile();

    averageOkrRuleController = moduleRef.get<AverageOkrRuleController>(
      AverageOkrRuleController,
    );
    averageOkrRuleService = moduleRef.get<AverageOkrRuleService>(
      AverageOkrRuleService,
    );
    averageOkrRuleRepository = moduleRef.get<Repository<AverageOkrRule>>(
      getRepositoryToken(AverageOkrRule),
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(averageOkrRuleController).toBeDefined();
  });
});
