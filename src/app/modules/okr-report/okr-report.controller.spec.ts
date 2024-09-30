import { Test, TestingModule } from '@nestjs/testing';
import { OkrReportController } from './okr-report.controller';

describe('OkrReportController', () => {
  let controller: OkrReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OkrReportController],
    }).compile();

    controller = module.get<OkrReportController>(OkrReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
