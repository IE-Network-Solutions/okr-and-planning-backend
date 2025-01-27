import { Test, TestingModule } from '@nestjs/testing';

import { UserVpScoring } from '../../entities/user-vp-scoring.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'jest-mock-extended';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import {
  paginationResultUserVpScoringData,
  UserVpScoringData,
} from './test-data';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateUserVpScoringDto } from '../../dtos/user-vp-scoring-dto/update-user-vp-scoring.dto';
import { UserVpScoringController } from '../../controllers/user-vp-scoring.controller';
import { UserVpScoringService } from '../../services/user-vp-scoring.service';
import { VpScoreInstanceService } from '../../services/vp-score-instance.service';
import { GetFromOrganizatiAndEmployeInfoService } from '../../../objective/services/get-data-from-org.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('UserVpScoringController', () => {
  let controller: UserVpScoringController;
  let service: UserVpScoringService;

  // private readonly vpScoreInstanceService: VpScoreInstanceService,
  // private readonly httpService:HttpService,
  // private readonly configService: ConfigService,
  // private readonly getUsersService:GetFromOrganizatiAndEmployeInfoService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserVpScoringController],
      providers: [
        UserVpScoringService,
        {
          provide: getRepositoryToken(UserVpScoring),
          useValue: mock<Repository<UserVpScoring>>(),
        },
        {
          provide: getRepositoryToken(UserVpScoring),
          useValue: mock<Repository<UserVpScoring>>(),
        },
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
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

    controller = module.get<UserVpScoringController>(UserVpScoringController);
    service = module.get<UserVpScoringService>(UserVpScoringService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUserVpScoring', () => {
    it('should call service.createUserVpScoring and return the result', async () => {
      const dto = UserVpScoringData();
      const tenantId = 'tenant-id';
      const result = UserVpScoringData();

      jest
        .spyOn(service, 'createUserVpScoring')
        .mockResolvedValue(result as any);

      const req = { tenantId } as Partial<Request> & { tenantId: string };
      const response = await controller.createUserVpScoring(dto, tenantId);

      expect(response).toEqual(result);
      expect(service.createUserVpScoring).toHaveBeenCalledWith(dto, tenantId);
    });
  });

  describe('findAllVpScoreInstance', () => {
    it('should return paginated VP criteria when valid pagination params are provided', async () => {
      const mockVpScoreInstanceService = {
        findAllUserVpScorings: jest.fn(),
      };
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        orderBy: 'id',
        orderDirection: 'ASC',
      };
      const vpResult: Pagination<UserVpScoring> =
        paginationResultUserVpScoringData();
      const paginationOptions = new PaginationDto();
      jest.spyOn(service, 'findAllUserVpScorings').mockResolvedValue(vpResult);

      mockVpScoreInstanceService.findAllUserVpScorings.mockResolvedValue(
        UserVpScoringData(),
      );

      const result = await controller.findAllUserVpScorings(
        'tenant1',
        paginationDto,
      );

      expect(service.findAllUserVpScorings).toHaveBeenCalledWith(
        'tenant1',
        paginationDto,
      );
      expect(result).toEqual(paginationResultUserVpScoringData());
    });
  });

  describe('findOneUserVpScoring', () => {
    it('should call service.findOneUserVpScoring and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = 'tenant-id';

      const result = UserVpScoringData();

      jest
        .spyOn(service, 'findOneUserVpScoring')
        .mockResolvedValue(result as any);

      const response = await controller.findOneUserVpScoring(id, tenantId);

      expect(response).toEqual(result);
      expect(service.findOneUserVpScoring).toHaveBeenCalledWith(id, tenantId);
    });

    it('should throw NotFoundException if work schedule not found', async () => {
      const id = '4567';
      const tenantId = 'tenant-id';

      jest
        .spyOn(service, 'findOneUserVpScoring')
        .mockRejectedValue(
          new NotFoundException('WorkSUserVpScoring with Id 4567 not found'),
        );

      await expect(
        controller.findOneUserVpScoring(id, tenantId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserVpScoring', () => {
    it('should call service.updateUserVpScoring and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      const dto = new UpdateUserVpScoringDto();
      const result = UserVpScoringData();

      jest
        .spyOn(service, 'updateUserVpScoring')
        .mockResolvedValue(result as any);

      const response = await controller.updateUserVpScoring(tenantId, id, dto);

      expect(response).toEqual(result);
      expect(service.updateUserVpScoring).toHaveBeenCalledWith(
        id,
        dto,
        tenantId,
      );
    });

    it('should throw BadRequestException on error', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';
      const dto = new UpdateUserVpScoringDto();

      jest
        .spyOn(service, 'updateUserVpScoring')
        .mockRejectedValue(new BadRequestException('Error'));

      await expect(
        controller.updateUserVpScoring(tenantId, id, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeUserVpScoring', () => {
    it('should call service.removeUserVpScoring and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      const result = UserVpScoringData();

      jest
        .spyOn(service, 'removeUserVpScoring')
        .mockResolvedValue(result as any);

      const response = await controller.removeUserVpScoring(tenantId, id);

      expect(response).toEqual(result);
      expect(service.removeUserVpScoring).toHaveBeenCalledWith(id, tenantId);
    });

    it('should throw NotFoundException if work schedule not found', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      jest
        .spyOn(service, 'removeUserVpScoring')
        .mockRejectedValue(
          new NotFoundException(
            'WorkSUserVpScoring with Id 672ae79c-6499-4ab3-a71a-d8a76fd68821 not found',
          ),
        );

      await expect(
        controller.removeUserVpScoring(tenantId, id),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
