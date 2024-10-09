import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OkrReportController } from '../okr-report/okr-report.controller';
import { ReportTask } from './entities/okr-report-task.entity';
import { OkrReportTaskService } from './okr-report-task.service';
import { PlanningPeriod } from '../planningPeriods/planning-periods/entities/planningPeriod.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { Plan } from '../plan/entities/plan.entity';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { OkrReportService } from '../okr-report/okr-report.service';
import { mock } from 'jest-mock-extended';

describe('OkrReportTaskController', () => {
  let okrReportController: OkrReportController;
  let okrReportTaskService: OkrReportTaskService;
  let okrReportTaskRepository: Repository<ReportTask>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OkrReportController],
      providers: [
        OkrReportTaskService,
        {
          provide: getRepositoryToken(ReportTask),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PlanningPeriodUser),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Plan),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PlanTask),
          useClass: Repository,
        },
        {
          provide: OkrReportService,
          useValue: mock<OkrReportService>(),
        },
      ],
    }).compile();

    okrReportController = moduleRef.get<OkrReportController>(
      OkrReportController,
    );
    okrReportTaskService = moduleRef.get<OkrReportTaskService>(
      OkrReportTaskService,
    );
    okrReportTaskRepository = moduleRef.get<Repository<ReportTask>>(
      getRepositoryToken(ReportTask),
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(okrReportController).toBeDefined();
  });
});
