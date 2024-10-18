import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OkrReportTaskService } from './okr-report-task.service';
import { ReportTask } from './entities/okr-report-task.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { Plan } from '../plan/entities/plan.entity';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { OkrReportService } from '../okr-report/okr-report.service';
import { OkrProgressService } from '../okr-progress/okr-progress.service';

describe('OkrReportTaskService', () => {
  let okrReportTaskService: OkrReportTaskService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OkrReportTaskService,
        {
          provide: getRepositoryToken(ReportTask),
          useValue: mock<Repository<ReportTask>>(),
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
          provide: getRepositoryToken(PlanTask),
          useValue: mock<Repository<PlanTask>>(),
        },
        {
          provide: OkrReportService,
          useValue: mock<OkrReportService>(),
        },
        {
          provide: OkrProgressService,
          useValue: mock<OkrProgressService>(),
        },
      ],
    }).compile();

    okrReportTaskService =
      moduleRef.get<OkrReportTaskService>(OkrReportTaskService);
  });

  it('should be defined', () => {
    expect(okrReportTaskService).toBeDefined();
  });
});
