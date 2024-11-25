import { Test, TestingModule } from '@nestjs/testing';
import { CriteriaTargetController } from '../../controllers/criteria-target.controller';
import { CriteriaTargetService } from '../../services/criteria-target.service';


describe('CriteriaTargetController', () => {
  let controller: CriteriaTargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CriteriaTargetController],
      providers: [CriteriaTargetService],
    }).compile();

    controller = module.get<CriteriaTargetController>(CriteriaTargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
