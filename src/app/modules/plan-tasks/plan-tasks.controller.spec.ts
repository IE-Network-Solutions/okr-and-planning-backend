import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PlanTasksController } from './plan-tasks.controller';
import { PlanTasksService } from './plan-tasks.service';
import { PlanTask } from './entities/plan-task.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { Plan } from '../plan/entities/plan.entity';
import { MilestonesService } from '../milestones/milestones.service';
import { KeyResultsService } from '../key-results/key-results.service';
import { mock } from 'jest-mock-extended';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';
import { ReportTask } from '../okr-report-task/entities/okr-report-task.entity';

describe('PlanTasksController', () => {
  let planTasksController: PlanTasksController;
  let planTasksService: PlanTasksService;
  let planTaskRepository: Repository<PlanTask>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PlanTasksController],
      providers: [
        PlanTasksService,
        {
          provide: getRepositoryToken(PlanTask),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PlanningPeriodUser),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ReportTask),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Plan),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ReportTask),
          useClass: Repository,
        },
        {
          provide: PaginationService,
          useValue: {
            paginate: jest.fn(),
          },
        },
        {
          provide: MilestonesService,
          useValue: mock<MilestonesService>(),
        },
        {
          provide: KeyResultsService,
          useValue: mock<KeyResultsService>(),
        },
        {
          provide: DataSource,
          useValue: mock<DataSource>(), // Mock the DataSource
        },
        {
          provide: GetFromOrganizatiAndEmployeInfoService,
          useValue: mock<GetFromOrganizatiAndEmployeInfoService>(),
        },
      ],
    }).compile();

    planTasksController =
      moduleRef.get<PlanTasksController>(PlanTasksController);
    planTasksService = moduleRef.get<PlanTasksService>(PlanTasksService);
    planTaskRepository = moduleRef.get<Repository<PlanTask>>(
      getRepositoryToken(PlanTask),
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(planTasksController).toBeDefined();
  });
});
