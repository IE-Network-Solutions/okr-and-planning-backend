import { Test, TestingModule } from '@nestjs/testing';
import { CriteriaTargetService } from './criteria-target.service';

describe('CriteriaTargetService', () => {
  let service: CriteriaTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CriteriaTargetService],
    }).compile();

    service = module.get<CriteriaTargetService>(CriteriaTargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
