import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PlanCommentsController } from './plan-comments.controller';
import { PlanCommentsService } from './plan-comments.service';
import { PlanComment } from './entities/plan-comment.entity';
import { Plan } from '../plan/entities/plan.entity';

describe('PlanCommentsController', () => {
  let planCommentsController: PlanCommentsController;
  let averageOkrRuleService: PlanCommentsService;
  let planCommentRepository: Repository<PlanComment>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PlanCommentsController],
      providers: [
        PlanCommentsService,
        {
          provide: getRepositoryToken(PlanComment),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Plan),
          useClass: Repository,
        },
        {
          provide: PaginationService,
          useValue: {
            paginate: jest.fn(),
          },
        },
      ],
    }).compile();

    planCommentsController = moduleRef.get<PlanCommentsController>(
      PlanCommentsController,
    );
 
    planCommentRepository = moduleRef.get<Repository<PlanComment>>(
      getRepositoryToken(PlanComment),
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(planCommentsController).toBeDefined();
  });
});
