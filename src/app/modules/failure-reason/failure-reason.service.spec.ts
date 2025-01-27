import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FailureReasonService } from './failure-reason.service';
import { FailureReason } from './entities/failure-reason.entity';

describe('FailureReasonService', () => {
  let failureReasonService: FailureReasonService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FailureReasonService,
        {
          provide: getRepositoryToken(FailureReason),
          useValue: mock<Repository<FailureReason>>(),
        },
      ],
    }).compile();

    failureReasonService =
      moduleRef.get<FailureReasonService>(FailureReasonService);
  });

  it('should be defined', () => {
    expect(failureReasonService).toBeDefined();
  });
});
