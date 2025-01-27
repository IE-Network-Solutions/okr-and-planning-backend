import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportCommentsController } from './report-comments.controller';
import { ReportCommentsService } from './report-comments.service';
import { ReportComment } from './entities/report-comment.entity';
import { Report } from '../okr-report/entities/okr-report.entity';

describe('ReportCommentsController', () => {
  let reportCommentsController: ReportCommentsController;
  let reportCommentsService: ReportCommentsService;
  let reportCommentRepository: Repository<ReportComment>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReportCommentsController],
      providers: [
        ReportCommentsService,
        {
          provide: getRepositoryToken(ReportComment),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Report),
          useClass: Repository,
        },
      ],
    }).compile();

    reportCommentsController = moduleRef.get<ReportCommentsController>(
      ReportCommentsController,
    );
    reportCommentsService = moduleRef.get<ReportCommentsService>(
      ReportCommentsService,
    );
    reportCommentRepository = moduleRef.get<Repository<ReportComment>>(
      getRepositoryToken(ReportComment),
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(reportCommentsController).toBeDefined();
  });
});
