import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { MetricTypesService } from './metric-types.service';
import { mock, MockProxy } from 'jest-mock-extended';
import { MetricType } from './entities/metric-type.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import {
  createMetricType,
  deleteMetricTypeData,
  metricTypeData,
  paginationResultMetricTypeData,
  updateMetricTypeData,
} from './test/test.data';
import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';

describe('MeticTypeService', () => {
  let metricTypeService: MetricTypesService;
  let milestoneRepository: MockProxy<Repository<MetricType>>;
  let paginationService: MockProxy<PaginationService>;

  const milestoneToken = getRepositoryToken(MetricType);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MetricTypesService,
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },

        {
          provide: milestoneToken,
          useValue: mock<Repository<MetricType>>(),
        },
      ],
    }).compile();

    metricTypeService = moduleRef.get<MetricTypesService>(MetricTypesService);
    milestoneRepository = moduleRef.get(milestoneToken);
    paginationService = moduleRef.get(PaginationService);
  });

  describe('create', () => {
    describe('when createobjectMilestone is called', () => {
      let metricType: MetricType;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
      beforeEach(() => {
        milestoneRepository.create.mockReturnValue(createMetricType() as any);
        milestoneRepository.save.mockResolvedValue(metricTypeData());
      });

      it('should callmilestoneRepository.create', async () => {
        await metricTypeService.createMetricType(createMetricType(), tenantId);
        expect(milestoneRepository.create).toHaveBeenCalledWith({
          ...createMetricType(),
          tenantId,
        });
      });

      it('should callmilestoneRepository.save', async () => {
        await metricTypeService.createMetricType(createMetricType(), tenantId);
        expect(milestoneRepository.save).toHaveBeenCalledWith(
          createMetricType(),
        );
      });

      it('should return the createdMilestone', async () => {
        metricType = await metricTypeService.createMetricType(
          metricTypeData(),
          tenantId,
        );
        expect(metricType).toEqual(metricTypeData());
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne objectMilestone is called', () => {
      let metricType: MetricType;

      beforeEach(async () => {
        milestoneRepository.findOneByOrFail.mockResolvedValue(metricTypeData());
        metricType = await metricTypeService.findOneMetricType(
          metricTypeData().id,
        );
      });

      it('should call milestoneRepository.findOne', async () => {
        await metricTypeService.findOneMetricType(metricTypeData().id);
        expect(milestoneRepository.findOneByOrFail).toHaveBeenCalledWith({
          id: metricTypeData().id,
        });
      });

      it('should return the Milestone', () => {
        expect(metricType).toEqual(metricTypeData());
      });
    });
  });
  describe('findAll', () => {
    describe('when findAllmilestones is called', () => {
      let tenantId: '57577865-7625-4170-a803-a73567e19216';

      beforeEach(async () => {
        paginationService.paginate.mockResolvedValue(
          paginationResultMetricTypeData(),
        );
      });

      it('should call paginationService.paginate with correct parameters', async () => {
        await metricTypeService.findAllMetricTypes(
          paginationOptions(),
          tenantId,
        );
        expect(paginationService.paginate).toHaveBeenCalledWith(
          milestoneRepository,
          'MetricType',
          {
            page: paginationOptions().page,
            limit: paginationOptions().limit,
          },
          paginationOptions().orderBy,
          paginationOptions().orderDirection,
          {tenantId}
        );
      });

      it('should return paginated clients', async () => {
        const clients = await metricTypeService.findAllMetricTypes(
          paginationOptions(),
          tenantId,
        );
        expect(clients).toEqual(paginationResultMetricTypeData());
      });
    });
  });

  describe('update', () => {
    describe('when updateMilestone is called', () => {
      let metricType: MetricType;

      beforeEach(async () => {
        jest
          .spyOn(metricTypeService, 'findOneMetricType')
          .mockResolvedValueOnce(metricTypeData())
          .mockResolvedValueOnce(updateMetricTypeData());

        milestoneRepository.update.mockResolvedValue(deleteMetricTypeData());

        metricType = await metricTypeService.updateMetricType(
          metricTypeData().id,
          updateMetricTypeData(),
        );
      });

      it('should call MilestoneService.findOneMilestone to check if Milestone exists', async () => {
        expect(metricTypeService.findOneMetricType).toHaveBeenCalledWith(
          metricTypeData().id,
        );
      });

      it('should call milestoneRepository.update to update the Milestone', async () => {
        expect(milestoneRepository.update).toHaveBeenCalledWith(
          { id: metricTypeData().id },
          updateMetricTypeData(),
        );
      });

      it('should call MilestoneService.findOneMilestone again to return the updated Milestone', async () => {
        expect(metricTypeService.findOneMetricType).toHaveBeenCalledWith(
          metricTypeData().id,
        );
      });

      it('should return the updated Milestone', () => {
        expect(metricType).toEqual(updateMetricTypeData());
      });
    });
  });

  describe('remove', () => {
    describe('when Milestone is called', () => {
      let metricType: MetricType;
      beforeEach(async () => {
        jest
          .spyOn(metricTypeService, 'findOneMetricType')
          .mockResolvedValueOnce(metricTypeData())
          .mockResolvedValueOnce(updateMetricTypeData());

        milestoneRepository.softRemove.mockResolvedValue(metricTypeData());
      });

      it('should callmilestoneRepository.softRemove', async () => {
        await metricTypeService.removeMetricType(metricTypeData().id);
        expect(milestoneRepository.softRemove).toHaveBeenCalledWith({
          id: metricTypeData().id,
        });
      });
      it('should return void when theMilestone is removed', async () => {
        const result = await metricTypeService.removeMetricType(
          metricTypeData().id,
        );
        expect(result).toEqual(metricTypeData());
      });
    });
  });
});
