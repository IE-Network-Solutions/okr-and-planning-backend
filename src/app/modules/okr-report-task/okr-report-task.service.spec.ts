import { Test, TestingModule } from '@nestjs/testing';
import { OkrReportTaskService } from './okr-report-task.service';

describe('OkrReportTaskService', () => {
  let service: OkrReportTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OkrReportTaskService],
    }).compile();

    service = module.get<OkrReportTaskService>(OkrReportTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
