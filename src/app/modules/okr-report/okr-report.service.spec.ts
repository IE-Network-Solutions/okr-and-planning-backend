import { Test, TestingModule } from '@nestjs/testing';
import { OkrReportService } from './okr-report.service';

describe('OkrReportService', () => {
  let service: OkrReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OkrReportService],
    }).compile();

    service = module.get<OkrReportService>(OkrReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
