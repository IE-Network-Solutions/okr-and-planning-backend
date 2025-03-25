import { mock, MockProxy } from 'jest-mock-extended';

import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Test } from '@nestjs/testing';
import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';
import { VpScoringCriteriaService } from '../../services/vp-scoring-criteria.service';
import { VpScoringCriterion } from '../../entities/vp-scoring-criterion.entity';
import {
  deleteUserVpScoringCriteriaData,
  paginationResultUserVpScoringCriteriaData,
  userVpScoringCriteriaData,
} from './test-data';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Pagination } from 'nestjs-typeorm-paginate';

describe('vpScoringCriteriaService', () => {
  let vpScoringCriteriaService: VpScoringCriteriaService;
  let vpScoringCriterionRepository: jest.Mocked<Repository<VpScoringCriterion>>;
  let paginationService: PaginationService;
  const VpScoringCriterionToken = getRepositoryToken(VpScoringCriterion);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        VpScoringCriteriaService,
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },

        {
          provide: VpScoringCriterionToken,
          useValue: mock<Repository<VpScoringCriterion>>(),
        },
      ],
    }).compile();

    vpScoringCriteriaService = moduleRef.get<VpScoringCriteriaService>(
      VpScoringCriteriaService,
    );
    vpScoringCriterionRepository = moduleRef.get(VpScoringCriterionToken);
    paginationService = moduleRef.get(PaginationService);
  });

  describe('create', () => {
    describe('when createobjectVpScoringCriterion is called', () => {
      let vpScoringCriterion: VpScoringCriterion;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
      beforeEach(() => {
        vpScoringCriterionRepository.create.mockReturnValue(
          userVpScoringCriteriaData() as any,
        );
        vpScoringCriterionRepository.save.mockResolvedValue(
          userVpScoringCriteriaData(),
        );
      });

      it('should callvpScoringCriterionRepository.create', async () => {
        await vpScoringCriteriaService.createVpScoringCriterion(
          userVpScoringCriteriaData(),
          tenantId,
        );
        expect(vpScoringCriterionRepository.create).toHaveBeenCalledWith({
          ...userVpScoringCriteriaData(),
          tenantId,
        });
      });

      it('should callvpScoringCriterionRepository.save', async () => {
        await vpScoringCriteriaService.createVpScoringCriterion(
          userVpScoringCriteriaData(),
          tenantId,
        );
        expect(vpScoringCriterionRepository.save).toHaveBeenCalledWith(
          userVpScoringCriteriaData(),
        );
      });

      it('should return the createdVpScoringCriterion', async () => {
        vpScoringCriterion =
          await vpScoringCriteriaService.createVpScoringCriterion(
            userVpScoringCriteriaData(),
            tenantId,
          );
        expect(vpScoringCriterion).toEqual(userVpScoringCriteriaData());
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne objectVpScoringCriterion is called', () => {
      let vpScoringCriterion: VpScoringCriterion;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';

      beforeEach(async () => {
        vpScoringCriterionRepository.findOne.mockResolvedValue(
          userVpScoringCriteriaData(),
        );
        vpScoringCriterion =
          await vpScoringCriteriaService.findOneVpScoringCriterion(
            userVpScoringCriteriaData().id,
          );
      });

      it('should call vpScoringCriterionRepository.findOne', async () => {
        await vpScoringCriteriaService.findOneVpScoringCriterion(
          userVpScoringCriteriaData().id,
        );
        expect(vpScoringCriterionRepository.findOne).toHaveBeenCalledWith({
          where: { id: userVpScoringCriteriaData().id },
        });
      });

      it('should return the VpScoringCriterion', async () => {
        let tenantId: '57577865-7625-4170-a803-a73567e19216';
        expect(
          await vpScoringCriteriaService.findOneVpScoringCriterion(
            userVpScoringCriteriaData().id,
          ),
        ).toEqual(userVpScoringCriteriaData());
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
      const paginatedResult: Pagination<VpScoringCriterion> =
        paginationResultUserVpScoringCriteriaData();
      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
      };
      vpScoringCriterionRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilderMock);
      const options = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      paginationService.paginate = jest.fn().mockResolvedValue(paginatedResult);

      const result = await vpScoringCriteriaService.findAllVpScoringCriterions(
        tenantId,
        paginationOptions,
      );

      expect(result).toEqual(paginatedResult);
      expect(paginationService.paginate).toHaveBeenCalledWith(
        queryBuilderMock,
        options,
      );
    });
  });

  describe('update', () => {
    describe('when updateVpScoringCriterion is called', () => {
      let vpScoringCriterion: VpScoringCriterion;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
      beforeEach(async () => {
        jest
          .spyOn(vpScoringCriteriaService, 'findOneVpScoringCriterion')
          .mockResolvedValueOnce(userVpScoringCriteriaData())
          .mockResolvedValueOnce(userVpScoringCriteriaData());

        vpScoringCriterionRepository.update.mockResolvedValue(
          deleteUserVpScoringCriteriaData(),
        );

        vpScoringCriterion =
          await vpScoringCriteriaService.updateVpScoringCriterion(
            userVpScoringCriteriaData().id,
            userVpScoringCriteriaData(),
            tenantId,
          );
      });

      it('should call vpScoringCriteriaService.findOneVpScoringCriterion to check if VpScoringCriterion exists', async () => {
        expect(
          vpScoringCriteriaService.findOneVpScoringCriterion,
        ).toHaveBeenCalledWith(userVpScoringCriteriaData().id);
      });

      it('should call vpScoringCriterionRepository.update to update the VpScoringCriterion', async () => {
        expect(vpScoringCriterionRepository.update).toHaveBeenCalledWith(
          { id: userVpScoringCriteriaData().id },
          userVpScoringCriteriaData(),
        );
      });

      it('should call vpScoringCriteriaService.findOneVpScoringCriterion again to return the updated VpScoringCriterion', async () => {
        expect(
          vpScoringCriteriaService.findOneVpScoringCriterion,
        ).toHaveBeenCalledWith(userVpScoringCriteriaData().id);
      });

      it('should return the updated VpScoringCriterion', () => {
        expect(vpScoringCriterion).toEqual(userVpScoringCriteriaData());
      });
    });
  });

  describe('remove', () => {
    describe('when VpScoringCriterion is called', () => {
      let vpScoringCriterion: VpScoringCriterion;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';

      beforeEach(async () => {
        jest
          .spyOn(vpScoringCriteriaService, 'findOneVpScoringCriterion')
          .mockResolvedValueOnce(userVpScoringCriteriaData())
          .mockResolvedValueOnce(userVpScoringCriteriaData());

        vpScoringCriterionRepository.softRemove.mockResolvedValue(
          userVpScoringCriteriaData(),
        );
      });

      it('should callvpScoringCriterionRepository.softRemove', async () => {
        await vpScoringCriteriaService.removeVpScoringCriterion(
          userVpScoringCriteriaData().id,
        );
        expect(vpScoringCriterionRepository.softRemove).toHaveBeenCalledWith({
          id: userVpScoringCriteriaData().id,
        });
      });
      it('should return void when theVpScoringCriterion is removed', async () => {
        const result = await vpScoringCriteriaService.removeVpScoringCriterion(
          userVpScoringCriteriaData().id,
        );
        expect(result).toEqual(userVpScoringCriteriaData());
      });
    });
  });
});
