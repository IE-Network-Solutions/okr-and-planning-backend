import { Test } from '@nestjs/testing';
import { OkrProgressService } from './okr-progress.service';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { mock } from 'jest-mock-extended';
import { MetricTypesService } from '../metric-types/metric-types.service';
import { MilestonesService } from '../milestones/milestones.service';
import { KeyResultsService } from '../key-results/key-results.service';

describe('keyResultsService', () => {
  let okrProgressService: OkrProgressService;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OkrProgressService,
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },

        {
          provide: MilestonesService,
          useValue: mock<MilestonesService>(),
        },
        {
          provide: KeyResultsService,
          useValue: mock<KeyResultsService>(),
        },
        {
          provide: MetricTypesService,
          useValue: mock<MetricTypesService>(),
        },
      ],
    }).compile();

    okrProgressService = moduleRef.get<OkrProgressService>(OkrProgressService);
  });

  it('should be defined', () => {
    expect(okrProgressService).toBeDefined();
  });
});
