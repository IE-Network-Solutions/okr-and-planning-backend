import { Test } from '@nestjs/testing';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { mock } from 'jest-mock-extended';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanTasksService } from './plan-tasks.service';
import { PlanTask } from './entities/plan-task.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { MilestonesService } from '../milestones/milestones.service';
import { KeyResultsService } from '../key-results/key-results.service';
import { Plan } from '../plan/entities/plan.entity';

describe('PlanTasksService', () => {
  let planTasksService: PlanTasksService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PlanTasksService,
        {
          provide: getRepositoryToken(PlanTask),
          useValue: mock<Repository<PlanTask>>(),
        },
        {
          provide: getRepositoryToken(PlanningPeriodUser),
          useValue: mock<Repository<PlanningPeriodUser>>(),
        },
        {
          provide: getRepositoryToken(Plan),
          useValue: mock<Repository<Plan>>(),
        },
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },
        {
          provide: MilestonesService,
          useValue: mock<MilestonesService>(),
        },
        {
          provide: KeyResultsService,
          useValue: mock<KeyResultsService>(),
        },
      ],
    }).compile();

    planTasksService = moduleRef.get<PlanTasksService>(PlanTasksService);
  });

  it('should be defined', () => {
    expect(planTasksService).toBeDefined();
  });
});
