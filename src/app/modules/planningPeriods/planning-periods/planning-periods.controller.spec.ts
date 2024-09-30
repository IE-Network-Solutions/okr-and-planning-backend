import { Test, TestingModule } from '@nestjs/testing';
import { PlanningPeriodsController } from './planning-periods.controller';

describe('PlanningPeriodsController', () => {
  let controller: PlanningPeriodsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanningPeriodsController],
    }).compile();

    controller = module.get<PlanningPeriodsController>(
      PlanningPeriodsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
