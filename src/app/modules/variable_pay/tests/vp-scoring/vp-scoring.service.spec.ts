import { mock, MockProxy } from 'jest-mock-extended';
import { VpScoringService } from '../../services/vp-scoring.service';
import { Connection, QueryRunner, Repository } from 'typeorm';
import { VpScoring } from '../../entities/vp-scoring.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { Test } from '@nestjs/testing';
import {
  createVpScoringData,
  deleteVpScoringData,
  paginationResultVpScoringData,
  VpScoringData,
} from './test-data';
import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';
import { UserVpScoringService } from '../../services/user-vp-scoring.service';
import { VpScoringCriteriaService } from '../../services/vp-scoring-criteria.service';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateVpScoringDto } from '../../dtos/vp-scoring-dto/update-vp-scoring.dto';

describe('VpScoringService', () => {
  let vpScoringService: VpScoringService;
  let connection: MockProxy<Connection>;
  let queryRunner: MockProxy<QueryRunner>;
  let vpScoringRepository: jest.Mocked<Repository<VpScoring>>;
  let paginationService: PaginationService;
  const VpScoringToken = getRepositoryToken(VpScoring);

  beforeEach(async () => {
    queryRunner = mock<QueryRunner>();
    queryRunner.connect.mockReturnValue(Promise.resolve());
    queryRunner.startTransaction.mockReturnValue(Promise.resolve());
    queryRunner.commitTransaction.mockReturnValue(Promise.resolve());
    queryRunner.rollbackTransaction.mockReturnValue(Promise.resolve());
    queryRunner.release.mockReturnValue(Promise.resolve());

    connection = mock<Connection>();
    connection.createQueryRunner.mockReturnValue(queryRunner);
    const moduleRef = await Test.createTestingModule({
      providers: [
        VpScoringService,
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },

        {
          provide: VpScoringToken,
          useValue: mock<Repository<VpScoring>>(),
        },
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },
        {
          provide: UserVpScoringService,
          useValue: mock<UserVpScoringService>(),
        },

        {
          provide: VpScoringCriteriaService,
          useValue: mock<VpScoringCriteriaService>(),
        },
        {
          provide: Connection,
          useValue: connection,
        },
      ],
    }).compile();

    vpScoringService = moduleRef.get<VpScoringService>(VpScoringService);
    vpScoringRepository = moduleRef.get(VpScoringToken);
    paginationService = moduleRef.get(PaginationService);
  });

  // describe('create', () => {
  //   const mockQueryRunner = {
  //     manager: {
  //       create: jest.fn(),
  //       save: jest.fn(),
  //     },
  //     startTransaction: jest.fn(),
  //     commitTransaction: jest.fn(),
  //     rollbackTransaction: jest.fn(),
  //     release: jest.fn(),
  //   };

  //   let vpScoring: VpScoring;
  //   const tenantId = '57577865-7625-4170-a803-a73567e19216';

  //   beforeEach(() => {
  //     vpScoringRepository.create.mockReturnValue(
  //       createVpScoringData() as any,
  //     );
  //     queryRunner.manager.save = jest.fn().mockResolvedValue(VpScoringData());
  //   });

  //   it('should call vpScoringRepository.create', async () => {
  //     vpScoring = await vpScoringService.createVpScoring(createVpScoringData(), tenantId);
  //     expect(vpScoringRepository.create).toHaveBeenCalledWith({
  //       ...createVpScoringData(),
  //       tenantId,
  //     });
  //   });

  //   it('should call queryRunner.manager.save', async () => {
  //     vpScoring = await vpScoringService.createVpScoring(createVpScoringData(), tenantId);
  //     expect(queryRunner.manager.save).toHaveBeenCalledWith(VpScoring,
  //       createVpScoringData(),);
  //   });

  //   it('should return the created VpScoring', async () => {
  //     vpScoring = await vpScoringService.createVpScoring(createVpScoringData(), tenantId);
  //     expect(vpScoring).toEqual(VpScoringData());
  //   });
  // });

  describe('findOne', () => {
    describe('when findOne objectVpScoring is called', () => {
      let vpScoring: VpScoring;

      beforeEach(async () => {
        vpScoringRepository.findOne.mockResolvedValue(VpScoringData());
        vpScoring = await vpScoringService.findOneVpScoring(VpScoringData().id);
      });

      it('should call VpScoringRepository.findOne', async () => {
        await vpScoringService.findOneVpScoring(VpScoringData().id);
        expect(vpScoringRepository.findOne).toHaveBeenCalledWith({
          where: { id: VpScoringData().id },
          relations: [
            'userVpScoring',
            'vpScoringCriterions',

            'vpScoringCriterions.vpCriteria',
          ],
        });
      });

      it('should return the VpScoring', async () => {
        expect(
          await vpScoringService.findOneVpScoring(VpScoringData().id),
        ).toEqual(VpScoringData());
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
      vpScoringRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilderMock);
      const options = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      paginationService.paginate = jest
        .fn()
        .mockResolvedValue(paginationResultVpScoringData());

      const result = await vpScoringService.findAllVpScorings(
        tenantId,
        paginationOptions,
      );

      expect(result).toEqual(paginationResultVpScoringData());
      expect(paginationService.paginate).toHaveBeenCalledWith(
        queryBuilderMock,
        options,
      );
    });
  });

  // describe('updateVpScoring', () => {
  //   it('should throw NotFoundException if work schedule not found', async () => {
  //     const id = 'be21f28b-4651-4d6f-8f08-d8128da64ee5';
  //     const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

  //     const updateDto = new UpdateVpScoringDto();

  //     jest
  //       .spyOn(vpScoringService, 'findOneVpScoring')
  //       .mockResolvedValue(null); // Simulate entity not found

  //     await expect(
  //       vpScoringService.updateVpScoring(id, updateDto, tenantId),
  //     ).rejects.toThrow(NotFoundException);
  //   });

  //   it('should not call update repository if VP scoring not found', async () => {
  //     jest.spyOn(vpScoringService, 'findOneVpScoring').mockResolvedValue(null);

  //     const vpScoringRepository = {
  //       update: jest.fn(),
  //       findOne: jest.fn(),
  //     };

  //     const mockUpdateDto = {
  //       name: 'Updated VP Scoring',
  //       totalPercentage: 100,
  //       vpScoringCriteria: [],
  //       createUserVpScoringDto: [],
  //     };

  //     await expect(
  //       vpScoringService.updateVpScoring('non-existent-id', mockUpdateDto, 'tenant-123'),
  //     ).rejects.toThrow(NotFoundException);

  //     expect(vpScoringRepository.update).not.toHaveBeenCalled();
  //   });
  // });

  describe('remove', () => {
    describe('when VpScoring is called', () => {
      let vpScoring: VpScoring;
      beforeEach(async () => {
        jest
          .spyOn(vpScoringService, 'findOneVpScoring')
          .mockResolvedValueOnce(VpScoringData())
          .mockResolvedValueOnce(VpScoringData());

        vpScoringRepository.softRemove.mockResolvedValue(VpScoringData());
      });

      it('should callVpScoringRepository.softRemove', async () => {
        await vpScoringService.removeVpScoring(VpScoringData().id);
        expect(vpScoringRepository.softRemove).toHaveBeenCalledWith({
          id: VpScoringData().id,
        });
      });
      it('should return void when theVpScoring is removed', async () => {
        const result = await vpScoringService.removeVpScoring(
          VpScoringData().id,
        );
        expect(result).toEqual(VpScoringData());
      });
    });
  });
});
