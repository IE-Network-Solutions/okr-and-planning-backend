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

describe('CriteriaTargetService', () => {
  let criteriaTargetService: CriteriaTargetService;
  let criteriaTargetRepository: MockProxy<Repository<CriteriaTarget>>;
  let paginationService: MockProxy<PaginationService>;

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
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
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
        criteriaTargetRepository.findOneByOrFail.mockResolvedValue(
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
  describe('findAll', () => {
    describe('when findAllCriteriaTargets is called', () => {
      let tenantId: '57577865-7625-4170-a803-a73567e19216';

      beforeEach(async () => {
        paginationService.paginate.mockResolvedValue(
          paginationResultCriteriaTargetData(),
        );
      });

      it('should call paginationService.paginate with correct parameters', async () => {
        await criteriaTargetService.findAllCriteriaTargets(
          tenantId,
          paginationOptions(),
        );
        expect(paginationService.paginate).toHaveBeenCalledWith(
          criteriaTargetRepository,
          'CriteriaTarget',
          {
            page: paginationOptions().page,
            limit: paginationOptions().limit,
          },
          paginationOptions().orderBy,
          paginationOptions().orderDirection,
          { tenantId },
        );
      });

      it('should return paginated clients', async () => {
        const clients = await criteriaTargetService.findAllCriteriaTargets(
          tenantId,

          paginationOptions(),
        );
        expect(clients).toEqual(paginationResultCriteriaTargetData());
      });
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
          criteriaTargetData(),
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
