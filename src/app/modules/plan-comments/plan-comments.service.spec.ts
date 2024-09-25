import { Test, TestingModule } from '@nestjs/testing';
import { PlanCommentsService } from './plan-comments.service';

describe('PlanCommentsService', () => {
  let service: PlanCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanCommentsService],
    }).compile();

    service = module.get<PlanCommentsService>(PlanCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
