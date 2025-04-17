import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OkrReportTaskService } from './okr-report-task.service';
import { ReportTask } from './entities/okr-report-task.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { Plan } from '../plan/entities/plan.entity';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { OkrReportService } from '../okr-report/okr-report.service';
import { OkrProgressService } from '../okr-progress/okr-progress.service';
import { Milestone } from '../milestones/entities/milestone.entity';
import { Report } from '../okr-report/entities/okr-report.entity';
import { UserVpScoringService } from '../variable_pay/services/user-vp-scoring.service';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';

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
          provide: GetFromOrganizatiAndEmployeInfoService,
          useValue: mock<GetFromOrganizatiAndEmployeInfoService>(),
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
          provide: getRepositoryToken(Milestone),
          useValue: mock<Repository<Milestone>>(), // Mock the DataSource
        },
        {
          provide: getRepositoryToken(Report),
          useValue: mock<Repository<Report>>(), // Mock the DataSource
        },
        {
          provide: OkrReportService,
          useValue: mock<OkrReportService>(),
        },
        {
          provide: OkrProgressService,
          useValue: mock<OkrProgressService>(),
        },
        {
          provide: UserVpScoringService,
          useValue: mock<UserVpScoringService>(),
        },
        {
          provide: DataSource,
          useValue: mock<DataSource>(), // Mock the DataSource
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
