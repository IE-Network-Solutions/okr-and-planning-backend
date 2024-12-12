import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';
import { VpCriteria } from '../../entities/vp-criteria.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import {
  createVpCriteriaData,
  deleteVpCriteriaData,
  paginationResultVpCriteriaData,
  vpCriteriaData,
} from './test-data';
import { VpCriteriaService } from '../../services/vp-criteria.service';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';

describe('VpCriteriaService', () => {
  let vpCriteriaService: VpCriteriaService;
  let vpCriteriaRepository: jest.Mocked<Repository<VpCriteria>>;
  let paginationService: PaginationService;
  const VpCriteriaToken = getRepositoryToken(VpCriteria);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        VpCriteriaService,
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },

        {
          provide: VpCriteriaToken,
          useValue: mock<Repository<VpCriteria>>(),
        },
      ],
    }).compile();

    vpCriteriaService = moduleRef.get<VpCriteriaService>(VpCriteriaService);
    vpCriteriaRepository = moduleRef.get(VpCriteriaToken);
    paginationService = moduleRef.get(PaginationService);
  });

  describe('create', () => {
    describe('when createobjectVpCriteria is called', () => {
      let vpCriteria: VpCriteria;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
      beforeEach(() => {
        vpCriteriaRepository.create.mockReturnValue(
          createVpCriteriaData() as any,
        );
        vpCriteriaRepository.save.mockResolvedValue(vpCriteriaData());
      });

      it('should callvpCriteriaRepository.create', async () => {
        await vpCriteriaService.createVpCriteria(createVpCriteriaData());
        expect(vpCriteriaRepository.create).toHaveBeenCalledWith(
          createVpCriteriaData(),
        );
      });

      it('should callvpCriteriaRepository.save', async () => {
        await vpCriteriaService.createVpCriteria(createVpCriteriaData());
        expect(vpCriteriaRepository.save).toHaveBeenCalledWith(
          createVpCriteriaData(),
        );
      });

      it('should return the createdVpCriteria', async () => {
        vpCriteria = await vpCriteriaService.createVpCriteria(vpCriteriaData());
        expect(vpCriteria).toEqual(vpCriteriaData());
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne objectVpCriteria is called', () => {
      let vpCriteria: VpCriteria;

      beforeEach(async () => {
        vpCriteriaRepository.findOne.mockResolvedValue(
          vpCriteriaData(),
        );
        vpCriteria = await vpCriteriaService.findOneVpCriteria(
          vpCriteriaData().id,
        );
      });

      it('should call vpCriteriaRepository.findOne', async () => {
        await vpCriteriaService.findOneVpCriteria(vpCriteriaData().id);
        expect(vpCriteriaRepository.findOne).toHaveBeenCalledWith({
          where: { id: vpCriteriaData().id },
          relations: ['vpScoringCriterions', 'criteriaTargets'],
        });
      });

      it('should return the VpCriteria', async () => {
        expect(
          await vpCriteriaService.findOneVpCriteria(vpCriteriaData().id),
        ).toEqual(vpCriteriaData());
      });
    });
  });
  describe('findAllMonths', () => {
    it('should return paginated Month', async () => {
      const paginationOptions: PaginationDto = {
        page: 1,
        limit: 10,
        orderBy: 'id',
        orderDirection: 'ASC',
      };
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';
      // const paginatedResult: Pagination<VpScoring> = paginationResultVpScoringData();
      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
      };
      vpCriteriaRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilderMock);
      const options = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      paginationService.paginate = jest
        .fn()
        .mockResolvedValue(paginationResultVpCriteriaData());

      const result = await vpCriteriaService.findAllVpCriteria(
        paginationOptions,
      );

      expect(result).toEqual(paginationResultVpCriteriaData());
      expect(paginationService.paginate).toHaveBeenCalledWith(
        queryBuilderMock,
        options,
      );
    });
  });

  describe('update', () => {
    describe('when updateVpCriteria is called', () => {
      let vpCriteria: VpCriteria;

      beforeEach(async () => {
        jest
          .spyOn(vpCriteriaService, 'findOneVpCriteria')
          .mockResolvedValueOnce(vpCriteriaData())
          .mockResolvedValueOnce(vpCriteriaData());

        vpCriteriaRepository.update.mockResolvedValue(deleteVpCriteriaData());

        vpCriteria = await vpCriteriaService.updateVpCriteria(
          vpCriteriaData().id,
          vpCriteriaData(),
        );
      });

      it('should call VpCriteriaService.findOneVpCriteria to check if VpCriteria exists', async () => {
        expect(vpCriteriaService.findOneVpCriteria).toHaveBeenCalledWith(
          vpCriteriaData().id,
        );
      });

      it('should call vpCriteriaRepository.update to update the VpCriteria', async () => {
        expect(vpCriteriaRepository.update).toHaveBeenCalledWith(
          { id: vpCriteriaData().id },
          vpCriteriaData(),
        );
      });

      it('should call VpCriteriaService.findOneVpCriteria again to return the updated VpCriteria', async () => {
        expect(vpCriteriaService.findOneVpCriteria).toHaveBeenCalledWith(
          vpCriteriaData().id,
        );
      });

      it('should return the updated VpCriteria', () => {
        expect(vpCriteria).toEqual(vpCriteriaData());
      });
    });
  });

  describe('remove', () => {
    describe('when VpCriteria is called', () => {
      let vpCriteria: VpCriteria;
      beforeEach(async () => {
        jest
          .spyOn(vpCriteriaService, 'findOneVpCriteria')
          .mockResolvedValueOnce(vpCriteriaData())
          .mockResolvedValueOnce(vpCriteriaData());

        vpCriteriaRepository.softRemove.mockResolvedValue(vpCriteriaData());
      });

      it('should callvpCriteriaRepository.softRemove', async () => {
        await vpCriteriaService.removeVpCriteria(vpCriteriaData().id);
        expect(vpCriteriaRepository.softRemove).toHaveBeenCalledWith({
          id: vpCriteriaData().id,
        });
      });
      it('should return void when theVpCriteria is removed', async () => {
        const result = await vpCriteriaService.removeVpCriteria(
          vpCriteriaData().id,
        );
        expect(result).toEqual(vpCriteriaData());
      });
    });
  });
});
