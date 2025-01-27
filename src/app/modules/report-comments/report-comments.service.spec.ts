import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportCommentsService } from './report-comments.service';
import { ReportComment } from './entities/report-comment.entity';
import { Report } from '../okr-report/entities/okr-report.entity';

describe('ReportCommentsService', () => {
  let reportCommentsService: ReportCommentsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReportCommentsService,
        {
          provide: getRepositoryToken(ReportComment),
          useValue: mock<Repository<ReportComment>>(),
        },
        {
          provide: getRepositoryToken(Report),
          useValue: mock<Repository<Report>>(),
        },
      ],
    }).compile();

    reportCommentsService = moduleRef.get<ReportCommentsService>(
      ReportCommentsService,
    );
  });

  it('should be defined', () => {
    expect(reportCommentsService).toBeDefined();
  });
});
