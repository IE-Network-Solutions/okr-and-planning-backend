import { Test, TestingModule } from '@nestjs/testing';
import { FailureReasonController } from './failure-reason.controller';

describe('FailureReasonController', () => {
  let controller: FailureReasonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FailureReasonController],
    }).compile();

    controller = module.get<FailureReasonController>(FailureReasonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
