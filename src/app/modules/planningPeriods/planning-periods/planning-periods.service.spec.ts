import { Test } from '@nestjs/testing';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { mock } from 'jest-mock-extended';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PlanningPeriodsService } from './planning-periods.service';
import { PlanningPeriod } from './entities/planningPeriod.entity';
import { PlanningPeriodUser } from './entities/planningPeriodUser.entity';
import { PlanService } from '../../plan/plan.service';
import { GetFromOrganizatiAndEmployeInfoService } from '../../objective/services/get-data-from-org.service';

describe('PlanningPeriodsService', () => {
  let planningPeriodsService: PlanningPeriodsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PlanningPeriodsService,
        {
          provide: getRepositoryToken(PlanningPeriod),
          useValue: mock<Repository<PlanningPeriod>>(),
        },
        {
          provide: getRepositoryToken(PlanningPeriodUser),
          useValue: mock<Repository<PlanningPeriodUser>>(),
        },
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },
        {
          provide: PlanService,
          useValue: mock<PlanService>(),
        },
        {
          provide: GetFromOrganizatiAndEmployeInfoService,
          useValue: mock<GetFromOrganizatiAndEmployeInfoService>(),
        },
        {
          provide: DataSource,
          useValue: mock<DataSource>(),
        },
      ],
    }).compile();

    planningPeriodsService = moduleRef.get<PlanningPeriodsService>(
      PlanningPeriodsService,
    );
  });

  it('should be defined', () => {
    expect(PlanningPeriodsService).toBeDefined();
  });
});
