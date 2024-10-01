import { Test } from '@nestjs/testing';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { mock } from 'jest-mock-extended';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanService } from './plan.service';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { Plan } from './entities/plan.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';

describe('PlanService', () => {
  let planService: PlanService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PlanService,
        {
          provide: getRepositoryToken(Plan),
          useValue: mock<Repository<Plan>>(),
        },
        {
          provide: getRepositoryToken(PlanTask),
          useValue: mock<Repository<PlanTask>>(),
        },
        {
          provide: getRepositoryToken(PlanningPeriodUser),
          useValue: mock<Repository<PlanningPeriodUser>>(),
        },
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },
      ],
    }).compile();

    planService = moduleRef.get<PlanService>(
      PlanService,
    );
  });

  it('should be defined', () => {
    expect(planService).toBeDefined();
  });
});
