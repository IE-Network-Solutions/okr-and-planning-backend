import { mock, MockProxy } from 'jest-mock-extended';

import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Test } from '@nestjs/testing';
import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';
import { VpScoreInstanceService } from '../../services/vp-score-instance.service';
import { VpScoreInstance } from '../../entities/vp-score-instance.entity';
import {
  deleteUserVpScoringInstanceData,
  paginationResultUserVpScoringInstanceData,
  userVpScoringInstanceData,
} from './test-data';
import { GetFromOrganizatiAndEmployeInfoService } from '../../../objective/services/get-data-from-org.service';
import { VpCriteriaService } from '../../services/vp-criteria.service';
import { CriteriaTargetService } from '../../services/criteria-target.service';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { BadRequestException } from '@nestjs/common';

describe('vpScoreInstanceService', () => {
  let vpScoreInstanceService: VpScoreInstanceService;

  let vpScoreInstanceRepository: jest.Mocked<Repository<VpScoreInstance>>;
  let paginationService: PaginationService;

  const VpScoreInstanceToken = getRepositoryToken(VpScoreInstance);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        VpScoreInstanceService,
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },

        {
          provide: VpScoreInstanceToken,
          useValue: mock<Repository<VpScoreInstance>>(),
        },
        {
          provide: GetFromOrganizatiAndEmployeInfoService,
          useValue: mock<GetFromOrganizatiAndEmployeInfoService>(),
        },
        {
          provide: VpCriteriaService,
          useValue: mock<VpCriteriaService>(),
        },
        {
          provide: CriteriaTargetService,
          useValue: mock<CriteriaTargetService>(),
        },
  
      ],
    }).compile();

    vpScoreInstanceService = moduleRef.get<VpScoreInstanceService>(
      VpScoreInstanceService,
    );
    vpScoreInstanceRepository = moduleRef.get(VpScoreInstanceToken);
    paginationService = moduleRef.get(PaginationService);
  });

  describe('create', () => {
    describe('when createobjectVpScoreInstance is called', () => {
      let vpScoreInstance: VpScoreInstance;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
      beforeEach(() => {
        vpScoreInstanceRepository.create.mockReturnValue(
          userVpScoringInstanceData() as any,
        );
        vpScoreInstanceRepository.save.mockResolvedValue(
          userVpScoringInstanceData(),
        );
      });

      it('should callvpScoreInstanceRepository.create', async () => {
        await vpScoreInstanceService.createVpScoreInstance(
          userVpScoringInstanceData(),
          tenantId,
        );
        expect(vpScoreInstanceRepository.create).toHaveBeenCalledWith({
          ...userVpScoringInstanceData(),
          tenantId,
        });
      });

      it('should callvpScoreInstanceRepository.save', async () => {
        await vpScoreInstanceService.createVpScoreInstance(
          userVpScoringInstanceData(),
          tenantId,
        );
        expect(vpScoreInstanceRepository.save).toHaveBeenCalledWith(
          userVpScoringInstanceData(),
        );
      });

      it('should return the createdVpScoreInstance', async () => {
        vpScoreInstance = await vpScoreInstanceService.createVpScoreInstance(
          userVpScoringInstanceData(),
          tenantId,
        );
        expect(vpScoreInstance).toEqual(userVpScoringInstanceData());
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne objectVpScoreInstance is called', () => {
      let vpScoreInstance: VpScoreInstance;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';

      beforeEach(async () => {
        vpScoreInstanceRepository.findOne.mockResolvedValue(
          userVpScoringInstanceData(),
        );
        vpScoreInstance = await vpScoreInstanceService.findOneVpScoreInstance(
          userVpScoringInstanceData().id,
        );
      });

      it('should call vpScoreInstanceRepository.findOne', async () => {
        vpScoreInstance = await vpScoreInstanceService.findOneVpScoreInstance(
          userVpScoringInstanceData().id,
        );
        expect(vpScoreInstanceRepository.findOne).toHaveBeenCalledWith({
          where: { id: userVpScoringInstanceData().id },
          relations: ['vpScoring'],
        });
      });

      it('should return the VpScoreInstance', async () => {
        let tenantId: '57577865-7625-4170-a803-a73567e19216';
        vpScoreInstance = await vpScoreInstanceService.findOneVpScoreInstance(
          userVpScoringInstanceData().id,
        );

        expect(vpScoreInstance).toEqual(userVpScoringInstanceData());
      });
    });
  });
  describe('findAllVpScoreInstance', () => {
    it('should return paginated VpScoreInstance', async () => {
      const paginationOptions: PaginationDto = {
        page: 1,
        limit: 10,
        orderBy: 'id',
        orderDirection: 'ASC',
      };
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';
      const paginatedResult: Pagination<VpScoreInstance> =
        paginationResultUserVpScoringInstanceData();
      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
      };
      vpScoreInstanceRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilderMock);
      const options = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      paginationService.paginate = jest.fn().mockResolvedValue(paginatedResult);

      const result = await vpScoreInstanceService.findAllVpScoreInstances(
        tenantId,
        null,
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
    describe('when updateVpScoreInstance is called', () => {
      let vpScoreInstance: VpScoreInstance;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
      beforeEach(async () => {
        jest
          .spyOn(vpScoreInstanceService, 'findOneVpScoreInstance')
          .mockResolvedValueOnce(userVpScoringInstanceData())
          .mockResolvedValueOnce(userVpScoringInstanceData());

        vpScoreInstanceRepository.update.mockResolvedValue(
          deleteUserVpScoringInstanceData(),
        );

        vpScoreInstance = await vpScoreInstanceService.updateVpScoreInstance(
          userVpScoringInstanceData().id,
          userVpScoringInstanceData(),
          tenantId,
        );
      });

      it('should call vpScoreInstanceService.findOneVpScoreInstance to check if VpScoreInstance exists', async () => {
        expect(
          vpScoreInstanceService.findOneVpScoreInstance,
        ).toHaveBeenCalledWith(userVpScoringInstanceData().id);
      });

      it('should call vpScoreInstanceRepository.update to update the VpScoreInstance', async () => {
        expect(vpScoreInstanceRepository.update).toHaveBeenCalledWith(
          { id: userVpScoringInstanceData().id },
          userVpScoringInstanceData(),
        );
      });

      it('should call vpScoreInstanceService.findOneVpScoreInstance again to return the updated VpScoreInstance', async () => {
        expect(
          vpScoreInstanceService.findOneVpScoreInstance,
        ).toHaveBeenCalledWith(userVpScoringInstanceData().id);
      });

      it('should return the updated VpScoreInstance', () => {
        expect(vpScoreInstance).toEqual(userVpScoringInstanceData());
      });
    });
  });

  describe('remove', () => {
    describe('when VpScoreInstance is called', () => {
      let vpScoreInstance: VpScoreInstance;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';

      beforeEach(async () => {
        jest
          .spyOn(vpScoreInstanceService, 'findOneVpScoreInstance')
          .mockResolvedValueOnce(userVpScoringInstanceData())
          .mockResolvedValueOnce(userVpScoringInstanceData());

        vpScoreInstanceRepository.softRemove.mockResolvedValue(
          userVpScoringInstanceData(),
        );
      });

      it('should callvpScoreInstanceRepository.softRemove', async () => {
        await vpScoreInstanceService.removeVpScoreInstance(
          userVpScoringInstanceData().id,
        );
        expect(vpScoreInstanceRepository.softRemove).toHaveBeenCalledWith({
          id: userVpScoringInstanceData().id,
        });
      });
      it('should return void when theVpScoreInstance is removed', async () => {
        const result = await vpScoreInstanceService.removeVpScoreInstance(
          userVpScoringInstanceData().id,
        );
        expect(result).toEqual(userVpScoringInstanceData());
      });
    });
  });
});
