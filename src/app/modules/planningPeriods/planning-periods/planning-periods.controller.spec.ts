import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { mock } from 'jest-mock-extended';
import { PlanningPeriod } from './entities/planningPeriod.entity';
import { PlanningPeriodsController } from './planning-periods.controller';
import { PlanningPeriodsService } from './planning-periods.service';
import { PlanningPeriodUser } from './entities/planningPeriodUser.entity';

describe('PlanningPeriodsController', () => {
  let planningPeriodsController: PlanningPeriodsController;
  let planningPeriodsService: PlanningPeriodsService;
  let planningPeriodRepository: Repository<PlanningPeriod>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PlanningPeriodsController],
      providers: [
        PlanningPeriodsService,
        {
          provide: getRepositoryToken(PlanningPeriod),
          useValue: mock<Repository<PlanningPeriod>>(), // Use mock for the repository
        },
        {
          provide: getRepositoryToken(PlanningPeriodUser),
          useValue: mock<Repository<PlanningPeriodUser>>(), // Use mock for the repository
        },
        {
          provide: PaginationService,
          useValue: {
            paginate: jest.fn(), // Mock the paginate method
          },
        },
      ],
    }).compile();

    planningPeriodsController = moduleRef.get<PlanningPeriodsController>(PlanningPeriodsController);
    planningPeriodsService = moduleRef.get<PlanningPeriodsService>(PlanningPeriodsService);
    planningPeriodRepository = moduleRef.get<Repository<PlanningPeriod>>(getRepositoryToken(PlanningPeriod));
    
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should be defined', () => {
    expect(planningPeriodsController).toBeDefined();
  });
});
