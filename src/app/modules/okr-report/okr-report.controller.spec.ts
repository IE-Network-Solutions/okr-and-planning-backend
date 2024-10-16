import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OkrReportController } from './okr-report.controller';
import { OkrReportService } from './okr-report.service';
import { Report } from './entities/okr-report.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { ReportTask } from '../okr-report-task/entities/okr-report-task.entity';
import { Plan } from '../plan/entities/plan.entity';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';

describe('OkrReportController', () => {
  let okrReportController: OkrReportController;
  let okrReportService: OkrReportService;
  let okrReportRepository: Repository<Report>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OkrReportController],
      providers: [
        OkrReportService,
        {
          provide: getRepositoryToken(Report),
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
          provide: getRepositoryToken(PlanTask),
          useClass: Repository,
        },
      ],
    }).compile();

    okrReportController =
      moduleRef.get<OkrReportController>(OkrReportController);
    okrReportService = moduleRef.get<OkrReportService>(OkrReportService);
    okrReportRepository = moduleRef.get<Repository<Report>>(
      getRepositoryToken(Report),
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(okrReportController).toBeDefined();
  });
});
