import { Test } from '@nestjs/testing';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { mock } from 'jest-mock-extended';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanCommentsService } from './plan-comments.service';
import { Plan } from '../plan/entities/plan.entity';
import { PlanComment } from './entities/plan-comment.entity';


describe('PlanCommentsService', () => {
  let planCommentsService: PlanCommentsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PlanCommentsService,
        {
          provide: getRepositoryToken(PlanComment),
          useValue: mock<Repository<PlanComment>>(),
        },
        {
          provide: getRepositoryToken(Plan),
          useValue: mock<Repository<Plan>>(),
        },
      ],
    }).compile();

    planCommentsService = moduleRef.get<PlanCommentsService>(
      PlanCommentsService,
    );
  });

  it('should be defined', () => {
    expect(planCommentsService).toBeDefined();
  });
});
