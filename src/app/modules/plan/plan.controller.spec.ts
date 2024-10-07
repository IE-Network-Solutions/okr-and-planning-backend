import { Test } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { Plan } from './entities/plan.entity';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';

describe('PlanController', () => {
  let planController: PlanController;
  let planService: PlanService;
  let planRepository: Repository<Plan>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PlanController],
      providers: [
        PlanService,
        {
          provide: getRepositoryToken(Plan),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PlanningPeriodUser),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PlanTask),
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

    planController = moduleRef.get<PlanController>(PlanController);
    planRepository = moduleRef.get<Repository<Plan>>(getRepositoryToken(Plan));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(planController).toBeDefined();
  });
});
