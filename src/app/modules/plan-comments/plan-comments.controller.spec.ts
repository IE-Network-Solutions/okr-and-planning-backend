import { Test, TestingModule } from '@nestjs/testing';
import { PlanCommentsController } from './plan-comments.controller';
import { PlanCommentsService } from './plan-comments.service';

describe('PlanCommentsController', () => {
  let controller: PlanCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanCommentsController],
      providers: [PlanCommentsService],
    }).compile();

    controller = module.get<PlanCommentsController>(PlanCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
