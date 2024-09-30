import { Test, TestingModule } from '@nestjs/testing';
import { PlanTasksService } from './plan-tasks.service';

describe('PlanTasksService', () => {
  let service: PlanTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanTasksService],
    }).compile();

    service = module.get<PlanTasksService>(PlanTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
