import { Test, TestingModule } from '@nestjs/testing';
import { FailureReasonService } from './failure-reason.service';

describe('FailureReasonService', () => {
  let service: FailureReasonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FailureReasonService],
    }).compile();

    service = module.get<FailureReasonService>(FailureReasonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
