import { mock, MockProxy } from 'jest-mock-extended';

import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserVpScoring } from '../../entities/user-vp-scoring.entity';
import { Test } from '@nestjs/testing';
import {
  createUserVpScoringData,
  deleteUserVpScoringData,
  paginationResultUserVpScoringData,
  UserVpScoringData,
} from './test-data';
import { UserVpScoringService } from '../../services/user-vp-scoring.service';
import { VpScoreInstanceService } from '../../services/vp-score-instance.service';
import { GetFromOrganizatiAndEmployeInfoService } from '../../../objective/services/get-data-from-org.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';

describe('UserVpScoringService', () => {
  let userVpScoringService: UserVpScoringService;
  let userVpScoringRepository: jest.Mocked<Repository<UserVpScoring>>;
  let paginationService: PaginationService;
  const UserVpScoringToken = getRepositoryToken(UserVpScoring);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserVpScoringService,
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },

        {
          provide: UserVpScoringToken,
          useValue: mock<Repository<UserVpScoring>>(),
        },

        {
          provide: VpScoreInstanceService,
          useValue: mock<VpScoreInstanceService>(),
        },
        {
          provide: GetFromOrganizatiAndEmployeInfoService,
          useValue: mock<GetFromOrganizatiAndEmployeInfoService>(),
        },
        {
          provide: HttpService,
          useValue: mock<HttpService>(),
        },
        {
          provide: ConfigService,
          useValue: mock<ConfigService>(),
        },
      ],
    }).compile();

    userVpScoringService =
      moduleRef.get<UserVpScoringService>(UserVpScoringService);
    userVpScoringRepository = moduleRef.get(UserVpScoringToken);
    paginationService = moduleRef.get(PaginationService);
  });

  describe('create', () => {
    describe('when createobjectUserVpScoring is called', () => {
      let userVpScoring: UserVpScoring;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
      beforeEach(() => {
        userVpScoringRepository.create.mockReturnValue(
          createUserVpScoringData() as any,
        );
        userVpScoringRepository.save.mockResolvedValue(UserVpScoringData());
      });

      it('should calluserVpScoringRepository.create', async () => {
        await userVpScoringService.createUserVpScoring(
          createUserVpScoringData(),
          tenantId,
        );
        expect(userVpScoringRepository.create).toHaveBeenCalledWith({
          ...createUserVpScoringData(),
          tenantId,
        });
      });

      it('should calluserVpScoringRepository.save', async () => {
        await userVpScoringService.createUserVpScoring(
          createUserVpScoringData(),
          tenantId,
        );
        expect(userVpScoringRepository.save).toHaveBeenCalledWith(
          createUserVpScoringData(),
        );
      });

      it('should return the createdUserVpScoring', async () => {
        userVpScoring = await userVpScoringService.createUserVpScoring(
          createUserVpScoringData(),
          tenantId,
        );
        expect(
          await userVpScoringService.createUserVpScoring(
            createUserVpScoringData(),
            tenantId,
          ),
        ).toEqual(UserVpScoringData());
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne objectUserVpScoring is called', () => {
      let userVpScoring: UserVpScoring;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';

      beforeEach(async () => {
        userVpScoringRepository.findOne.mockResolvedValue(UserVpScoringData());
        userVpScoring = await userVpScoringService.findOneUserVpScoring(
          UserVpScoringData().id,
          tenantId,
        );
      });

      it('should call userVpScoringRepository.findOne', async () => {
        await userVpScoringService.findOneUserVpScoring(
          UserVpScoringData().id,
          tenantId,
        );
        expect(userVpScoringRepository.findOne).toHaveBeenCalledWith({
          where: { id: UserVpScoringData().id, tenantId: tenantId },
          relations: ['vpScoring'],
        });
      });

      it('should return the UserVpScoring', async () => {
        let tenantId: '57577865-7625-4170-a803-a73567e19216';
        expect(
          await userVpScoringService.findOneUserVpScoring(
            UserVpScoringData().id,
            tenantId,
          ),
        ).toEqual(UserVpScoringData());
      });
    });
  });
  describe('findAllUserVpScoring', () => {
    it('should return paginated Month', async () => {
      const paginationOptions: PaginationDto = {
        page: 1,
        limit: 10,
        orderBy: 'id',
        orderDirection: 'ASC',
      };
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';
      // const paginatedResult: Pagination<UserVpScoring> = paginationResultUserVpScoringData();
      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
      };
      userVpScoringRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilderMock);
      const options = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      paginationService.paginate = jest
        .fn()
        .mockResolvedValue(paginationResultUserVpScoringData());

      const result = await userVpScoringService.findAllUserVpScorings(
        tenantId,
        paginationOptions,
      );

      expect(result).toEqual(paginationResultUserVpScoringData());
      expect(paginationService.paginate).toHaveBeenCalledWith(
        queryBuilderMock,
        options,
      );
    });
  });

  describe('update', () => {
    describe('when updateUserVpScoring is called', () => {
      let userVpScoring: UserVpScoring;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
      beforeEach(async () => {
        jest
          .spyOn(userVpScoringService, 'findOneUserVpScoring')
          .mockResolvedValueOnce(UserVpScoringData())
          .mockResolvedValueOnce(UserVpScoringData());

        userVpScoringRepository.update.mockResolvedValue(
          deleteUserVpScoringData(),
        );

        userVpScoring = await userVpScoringService.updateUserVpScoring(
          UserVpScoringData().id,
          createUserVpScoringData(),
          tenantId,
        );
      });

      it('should call UserVpScoringService.findOneUserVpScoring to check if UserVpScoring exists', async () => {
        expect(userVpScoringService.findOneUserVpScoring).toHaveBeenCalledWith(
          UserVpScoringData().id,
          tenantId,
        );
      });

      it('should call userVpScoringRepository.update to update the UserVpScoring', async () => {
        const id = UserVpScoringData().id;
        expect(userVpScoringRepository.update).toHaveBeenCalledWith(
          { id: id },
          UserVpScoringData(),
        );
      });

      it('should call UserVpScoringService.findOneUserVpScoring again to return the updated UserVpScoring', async () => {
        expect(userVpScoringService.findOneUserVpScoring).toHaveBeenCalledWith(
          UserVpScoringData().id,
          tenantId,
        );
      });

      it('should return the updated UserVpScoring', () => {
        expect(userVpScoring).toEqual(UserVpScoringData());
      });
    });
  });

  describe('remove', () => {
    describe('when UserVpScoring is called', () => {
      let userVpScoring: UserVpScoring;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';

      beforeEach(async () => {
        jest
          .spyOn(userVpScoringService, 'findOneUserVpScoring')
          .mockResolvedValueOnce(UserVpScoringData())
          .mockResolvedValueOnce(UserVpScoringData());

        userVpScoringRepository.softRemove.mockResolvedValue(
          UserVpScoringData(),
        );
      });

      it('should calluserVpScoringRepository.softRemove', async () => {
        await userVpScoringService.removeUserVpScoring(
          UserVpScoringData().id,
          tenantId,
        );
        expect(userVpScoringRepository.softRemove).toHaveBeenCalledWith({
          id: UserVpScoringData().id,
        });
      });
      it('should return void when theUserVpScoring is removed', async () => {
        const result = await userVpScoringService.removeUserVpScoring(
          UserVpScoringData().id,
          tenantId,
        );
        expect(result).toEqual(UserVpScoringData());
      });
    });
  });
});
