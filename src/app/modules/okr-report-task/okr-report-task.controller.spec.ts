import { Test, TestingModule } from '@nestjs/testing';
import { OkrReportTaskController } from './okr-report-task.controller';

describe('OkrReportTaskController', () => {
  let controller: OkrReportTaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OkrReportTaskController],
    }).compile();

    controller = module.get<OkrReportTaskController>(OkrReportTaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
