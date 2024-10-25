import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OkrReportService } from './okr-report.service';
import { Report } from './entities/okr-report.entity';
import { ReportTask } from '../okr-report-task/entities/okr-report-task.entity';
import { Plan } from '../plan/entities/plan.entity';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { PlanningPeriodsService } from '../planningPeriods/planning-periods/planning-periods.service';

describe('OkrReportService', () => {
  let okrReportService: OkrReportService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OkrReportService,
        {
          provide: getRepositoryToken(Report),
          useValue: mock<Repository<Report>>(),
        },
        {
          provide: getRepositoryToken(ReportTask),
          useValue: mock<Repository<ReportTask>>(),
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
          provide: PlanningPeriodsService,
          useValue: mock<PlanningPeriodsService>(),
        },
      ],
    }).compile();

    okrReportService = moduleRef.get<OkrReportService>(OkrReportService);
  });

  it('should be defined', () => {
    expect(okrReportService).toBeDefined();
  });
});
