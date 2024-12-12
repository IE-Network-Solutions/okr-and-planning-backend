import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { CriteriaTarget } from '../../entities/criteria-target.entity';
import { CriteriaTargetService } from '../../services/criteria-target.service';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import {
  testCreateCriteriaTargetForMultipleDto,
  criteriaTargetData,
  paginationResultCriteriaTargetData,
  deleteCriteriaTargetData,
  createCriteriaTargetData,
  updateCriteriaTargetData,
} from './test-data';
import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';

describe('CriteriaTargetService', () => {
  let criteriaTargetService: CriteriaTargetService;

  let criteriaTargetRepository: jest.Mocked<Repository<CriteriaTarget>>;
  let paginationService: PaginationService;

  const CriteriaTargetToken = getRepositoryToken(CriteriaTarget);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CriteriaTargetService,
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },

        {
          provide: CriteriaTargetToken,
          useValue: mock<Repository<CriteriaTarget>>(),
        },
      ],
    }).compile();

    criteriaTargetService = moduleRef.get<CriteriaTargetService>(
      CriteriaTargetService,
    );
    criteriaTargetRepository = moduleRef.get(CriteriaTargetToken);
    paginationService = moduleRef.get(PaginationService);
  });

  describe('create', () => {
    describe('when createobjectCriteriaTarget is called', () => {
      let criteriaTarget: CriteriaTarget[];
      let tenantId: '179055e7-a27c-4d9d-9538-2b2a115661bd';
      beforeEach(() => {
        criteriaTargetRepository.create.mockReturnValue(
          testCreateCriteriaTargetForMultipleDto() as any,
        );
        criteriaTargetRepository.save.mockResolvedValue(criteriaTargetData());
      });

      it('should callcriteriaTargetRepository.create', async () => {
        await criteriaTargetService.createCriteriaTarget(
          testCreateCriteriaTargetForMultipleDto(),
          tenantId,
        );
        expect(criteriaTargetRepository.create).toHaveBeenCalledWith({
          ...createCriteriaTargetData(),
          tenantId,
        });
      });

      it('should callcriteriaTargetRepository.save', async () => {
        await criteriaTargetService.createCriteriaTarget(
          testCreateCriteriaTargetForMultipleDto(),
          tenantId,
        );
        expect(criteriaTargetRepository.save).toHaveBeenCalledWith(
          testCreateCriteriaTargetForMultipleDto(),
        );
      });

      it('should return the createdCriteriaTarget', async () => {
        criteriaTarget = await criteriaTargetService.createCriteriaTarget(
          testCreateCriteriaTargetForMultipleDto(),
          tenantId,
        );
        expect(criteriaTarget).toEqual([criteriaTargetData()]);
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne objectCriteriaTarget is called', () => {
      let criteriaTarget: CriteriaTarget;

      beforeEach(async () => {
        criteriaTargetRepository.findOne.mockResolvedValue(
          criteriaTargetData(),
        );
        criteriaTarget = await criteriaTargetService.findOneCriteriaTarget(
          criteriaTargetData().id,
        );
      });

      it('should call criteriaTargetRepository.findOne', async () => {
        await criteriaTargetService.findOneCriteriaTarget(
          criteriaTargetData().id,
        );
        expect(criteriaTargetRepository.findOne).toHaveBeenCalledWith({
          where: { id: criteriaTargetData().id },
          relations: ['vpCriteria'],
        });
      });

      it('should return the CriteriaTarget', async () => {
        let tenantId: '57577865-7625-4170-a803-a73567e19216';
        expect(
          await criteriaTargetService.findOneCriteriaTarget(
            criteriaTargetData().id,
          ),
        ).toEqual(criteriaTargetData());
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
      criteriaTargetRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilderMock);
      const options = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      paginationService.paginate = jest
        .fn()
        .mockResolvedValue(paginationResultCriteriaTargetData());

      const result = await criteriaTargetService.findAllCriteriaTargets(
        tenantId,
        paginationOptions,
      );

      expect(result).toEqual(paginationResultCriteriaTargetData());
      expect(paginationService.paginate).toHaveBeenCalledWith(
        queryBuilderMock,
        options,
      );
    });
  });

  describe('update', () => {
    describe('when updateCriteriaTarget is called', () => {
      let criteriaTarget: CriteriaTarget;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
      beforeEach(async () => {
        jest
          .spyOn(criteriaTargetService, 'findOneCriteriaTarget')
          .mockResolvedValueOnce(criteriaTargetData())
          .mockResolvedValueOnce(criteriaTargetData());

        criteriaTargetRepository.update.mockResolvedValue(
          deleteCriteriaTargetData(),
        );

        criteriaTarget = await criteriaTargetService.updateCriteriaTarget(
          criteriaTargetData().id,
          updateCriteriaTargetData(),
          tenantId,
        );
      });

      it('should call CriteriaTargetService.findOneCriteriaTarget to check if CriteriaTarget exists', async () => {
        expect(
          criteriaTargetService.findOneCriteriaTarget,
        ).toHaveBeenCalledWith(criteriaTargetData().id);
      });

      it('should call criteriaTargetRepository.update to update the CriteriaTarget', async () => {
        expect(criteriaTargetRepository.update).toHaveBeenCalledWith(
          { id: criteriaTargetData().id },
          updateCriteriaTargetData(),
        );
      });

      it('should call CriteriaTargetService.findOneCriteriaTarget again to return the updated CriteriaTarget', async () => {
        expect(
          criteriaTargetService.findOneCriteriaTarget,
        ).toHaveBeenCalledWith(criteriaTargetData().id);
      });

      it('should return the updated CriteriaTarget', () => {
        expect(criteriaTarget).toEqual(criteriaTargetData());
      });
    });
  });

  describe('remove', () => {
    describe('when CriteriaTarget is called', () => {
      let criteriaTarget: CriteriaTarget;
      beforeEach(async () => {
        jest
          .spyOn(criteriaTargetService, 'findOneCriteriaTarget')
          .mockResolvedValueOnce(criteriaTargetData())
          .mockResolvedValueOnce(criteriaTargetData());

        criteriaTargetRepository.softRemove.mockResolvedValue(
          criteriaTargetData(),
        );
      });

      it('should callcriteriaTargetRepository.softRemove', async () => {
        await criteriaTargetService.removeCriteriaTarget(
          criteriaTargetData().id,
        );
        expect(criteriaTargetRepository.softRemove).toHaveBeenCalledWith({
          id: criteriaTargetData().id,
        });
      });
      it('should return void when theCriteriaTarget is removed', async () => {
        const result = await criteriaTargetService.removeCriteriaTarget(
          criteriaTargetData().id,
        );
        expect(result).toEqual(criteriaTargetData());
      });
    });
  });
});
