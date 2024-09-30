import { Test, TestingModule } from '@nestjs/testing';
import { PlanTasksController } from './plan-tasks.controller';
import { PlanTasksService } from './plan-tasks.service';

describe('PlanTasksController', () => {
  let controller: PlanTasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanTasksController],
      providers: [PlanTasksService],
    }).compile();

    controller = module.get<PlanTasksController>(PlanTasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
