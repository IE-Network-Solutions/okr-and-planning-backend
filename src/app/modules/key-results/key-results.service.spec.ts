import { mock, MockProxy } from 'jest-mock-extended';
import { KeyResultsService } from './key-results.service';
import { Repository } from 'typeorm';
import { KeyResult } from './entities/key-result.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import {
  createKeyResulteData,
  deleteKeyResultData,
  keyResultData,
  paginationResultkeyResultData,
  updatekeyResultData,
} from './test/test.data';

import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';
import { MilestonesService } from '../milestones/milestones.service';

describe('keyResultService', () => {
  let keyResultService: KeyResultsService;
  let keyResultRepository: MockProxy<Repository<KeyResult>>;
  let paginationService: MockProxy<PaginationService>;
  let keyResultervice: MockProxy<MilestonesService>;

  const keyResultToken = getRepositoryToken(KeyResult);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        KeyResultsService,
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },
        {
          provide: MilestonesService,
          useValue: mock<MilestonesService>(),
        },

        {
          provide: keyResultToken,
          useValue: mock<Repository<KeyResult>>(),
        },
      ],
    }).compile();

    keyResultService = moduleRef.get<KeyResultsService>(KeyResultsService);
    keyResultRepository = moduleRef.get(keyResultToken);
    paginationService = moduleRef.get(PaginationService);
    keyResultervice = moduleRef.get(MilestonesService);
  });

  describe('create', () => {
    describe('when createkeyResult is called', () => {
      let keyResult: KeyResult;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
      beforeEach(() => {
        keyResultRepository.create.mockReturnValue(
          createKeyResulteData() as any,
        );
        keyResultRepository.save.mockResolvedValue(keyResultData());
      });

      it('should call keyResultRepository.create', async () => {
        await keyResultService.createkeyResult(
          createKeyResulteData(),
          tenantId,
        );
        expect(keyResultRepository.create).toHaveBeenCalledWith({
          ...createKeyResulteData(),
          tenantId,
        });
      });

      it('should callkeyResultRepository.save', async () => {
        await keyResultService.createkeyResult(
          createKeyResulteData(),
          tenantId,
        );
        expect(keyResultRepository.save).toHaveBeenCalledWith(
          createKeyResulteData(),
        );
      });

      it('should return the createdkeyResult', async () => {
        keyResult = await keyResultService.createkeyResult(
          createKeyResulteData(),
          tenantId,
        );
        expect(keyResult).toEqual(keyResultData());
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne keyResult is called', () => {
      let keyResult: KeyResult;

      beforeEach(async () => {
        keyResultRepository.findOneByOrFail.mockResolvedValue(keyResultData());
        keyResult = await keyResultService.findOnekeyResult(keyResultData().id);
      });

      it('should call keyResultRepository.findOne', async () => {
        await keyResultService.findOnekeyResult(keyResultData().id);
        expect(keyResultRepository.findOneByOrFail).toHaveBeenCalledWith({
          id: keyResultData().id,
        });
      });

      it('should return the keyresult', () => {
        expect(keyResult).toEqual(keyResultData());
      });
    });
  });
  describe('findAll', () => {
    describe('when findAllkeyresult is called', () => {
      let tenantId: '57577865-7625-4170-a803-a73567e19216';

      beforeEach(async () => {
        paginationService.paginate.mockResolvedValue(
          paginationResultkeyResultData(),
        );
      });

      it('should call paginationService.paginate with correct parameters', async () => {
        await keyResultService.findAllkeyResults(paginationOptions(), tenantId);
        expect(paginationService.paginate).toHaveBeenCalledWith(
          keyResultRepository,
          'keyResult',
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
        const clients = await keyResultService.findAllkeyResults(
          paginationOptions(),
          tenantId,
        );
        expect(clients).toEqual(paginationResultkeyResultData());
      });
    });
  });

  describe('update', () => {
    describe('when updatekeyResult is called', () => {
      let keyResult: KeyResult;

      beforeEach(async () => {
        jest
          .spyOn(keyResultService, 'findOnekeyResult')
          .mockResolvedValueOnce(keyResultData())
          .mockResolvedValueOnce(keyResultData());

        keyResultRepository.update.mockResolvedValue(deleteKeyResultData());

        keyResult = await keyResultService.updatekeyResult(
          keyResultData().id,
          updatekeyResultData(),
        );
      });

      it('should call keyResultService.findOnekeyResult to check if keyResult exists', async () => {
        expect(keyResultService.findOnekeyResult).toHaveBeenCalledWith(
          keyResultData().id,
        );
      });

      it('should call keyResultRepository.update to update the keyResult', async () => {
        expect(keyResultRepository.update).toHaveBeenCalledWith(
          { id: keyResultData().id },
          updatekeyResultData(),
        );
      });

      it('should call keyResultService.findOnekeyResult again to return the updated keyResult', async () => {
        expect(keyResultService.findOnekeyResult).toHaveBeenCalledWith(
          keyResultData().id,
        );
      });

      it('should return the updated keyResult', () => {
        expect(keyResult).toEqual(updatekeyResultData());
      });
    });
  });

  describe('remove', () => {
    describe('when keyResult is called', () => {
      let keyResult: KeyResult;
      beforeEach(async () => {
        jest
          .spyOn(keyResultService, 'findOnekeyResult')
          .mockResolvedValueOnce(keyResultData())
          .mockResolvedValueOnce(keyResultData());

        keyResultRepository.softRemove.mockResolvedValue(keyResultData());
      });

      it('should callkeyResultRepository.softRemove', async () => {
        await keyResultService.removekeyResult(keyResultData().id);
        expect(keyResultRepository.softRemove).toHaveBeenCalledWith({
          id: keyResultData().id,
        });
      });
      it('should return void when thekeyResult is removed', async () => {
        const result = await keyResultService.removekeyResult(
          keyResultData().id,
        );
        expect(result).toEqual(keyResultData());
      });
    });
  });
});
