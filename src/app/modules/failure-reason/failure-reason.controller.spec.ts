import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FailureReasonService } from './failure-reason.service';
import { FailureReasonController } from './failure-reason.controller';
import { FailureReason } from './entities/failure-reason.entity';

describe('FailureReasonController', () => {
  let failureReasonController: FailureReasonController;
  let failureReasonService: FailureReasonService;
  let failureReasonRepository: Repository<FailureReason>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FailureReasonController],
      providers: [
        FailureReasonService,
        {
          provide: getRepositoryToken(FailureReason),
          useClass: Repository,
        },
      ],
    }).compile();

    failureReasonController = moduleRef.get<FailureReasonController>(
      FailureReasonController,
    );
    failureReasonService = moduleRef.get<FailureReasonService>(
      FailureReasonService,
    );
    failureReasonRepository = moduleRef.get<Repository<FailureReason>>(
      getRepositoryToken(FailureReason),
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(failureReasonController).toBeDefined();
  });
});
