import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'jest-mock-extended';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VpScoringCriteriaController } from '../../controllers/vp-scoring-criteria.controller';
import { VpScoringCriteriaService } from '../../services/vp-scoring-criteria.service';
import { VpScoringCriterion } from '../../entities/vp-scoring-criterion.entity';
import { UpdateVpScoringCriterionDto } from '../../dtos/vp-scoring-criteria-dto/update-vp-scoring-criterion.dto';
import {
  paginationResultUserVpScoringCriteriaData,
  userVpScoringCriteriaData,
} from './test-data';

describe('VpScoringCriteriaController', () => {
  let controller: VpScoringCriteriaController;
  let service: VpScoringCriteriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VpScoringCriteriaController],
      providers: [
        VpScoringCriteriaService,
        {
          provide: getRepositoryToken(VpScoringCriterion),
          useValue: mock<Repository<VpScoringCriterion>>(),
        },
        {
          provide: getRepositoryToken(VpScoringCriterion),
          useValue: mock<Repository<VpScoringCriterion>>(),
        },
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },
      ],
    }).compile();

    controller = module.get<VpScoringCriteriaController>(
      VpScoringCriteriaController,
    );
    service = module.get<VpScoringCriteriaService>(VpScoringCriteriaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createVpScoringCriterion', () => {
    it('should call service.createVpScoringCriterion and return the result', async () => {
      const dto = userVpScoringCriteriaData();
      const tenantId = 'tenant-id';
      const result = userVpScoringCriteriaData();

      jest
        .spyOn(service, 'createVpScoringCriterion')
        .mockResolvedValue(result as any);

      const req = { tenantId } as Partial<Request> & { tenantId: string };
      const response = await controller.createVpScoringCriteria(dto, tenantId);

      expect(response).toEqual(result);
      expect(service.createVpScoringCriterion).toHaveBeenCalledWith(
        dto,
        tenantId,
      );
    });
  });

  describe('findAllVpScoreInstance', () => {
    it('should return paginated VP criteria when valid pagination params are provided', async () => {
      const mockVpScoreInstanceService = {
        findAllVpScoringCriterions: jest.fn(),
      };
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        orderBy: 'id',
        orderDirection: 'ASC',
      };
      const vpResult: Pagination<VpScoringCriterion> =
        paginationResultUserVpScoringCriteriaData();
      const paginationOptions = new PaginationDto();
      jest
        .spyOn(service, 'findAllVpScoringCriterions')
        .mockResolvedValue(vpResult);

      mockVpScoreInstanceService.findAllVpScoringCriterions.mockResolvedValue(
        userVpScoringCriteriaData(),
      );

      const result = await controller.findAllVpScoringCriterion(
        'tenant1',
        paginationDto,
      );

      expect(service.findAllVpScoringCriterions).toHaveBeenCalledWith(
        'tenant1',
        paginationDto,
      );
      expect(result).toEqual(paginationResultUserVpScoringCriteriaData());
    });
  });

  describe('findOneVpScoringCriterion', () => {
    it('should call service.findOneVpScoringCriterion and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = 'tenant-id';

      const result = userVpScoringCriteriaData();

      jest
        .spyOn(service, 'findOneVpScoringCriterion')
        .mockResolvedValue(result as any);

      const response = await controller.findOneVpScoringCriterion(id);

      expect(response).toEqual(result);
      expect(service.findOneVpScoringCriterion).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if work schedule not found', async () => {
      const id = '4567';
      const tenantId = 'tenant-id';

      jest
        .spyOn(service, 'findOneVpScoringCriterion')
        .mockRejectedValue(
          new NotFoundException(
            'WorkSVpScoringCriterion with Id 4567 not found',
          ),
        );

      await expect(controller.findOneVpScoringCriterion(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateVpScoringCriterion', () => {
    it('should call service.updateVpScoringCriterion and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      const dto = new UpdateVpScoringCriterionDto();
      const result = userVpScoringCriteriaData();

      jest
        .spyOn(service, 'updateVpScoringCriterion')
        .mockResolvedValue(result as any);

      const response = await controller.updateVpScoringCriteria(
        tenantId,
        id,
        dto,
      );

      expect(response).toEqual(result);
      expect(service.updateVpScoringCriterion).toHaveBeenCalledWith(
        id,
        dto,
        tenantId,
      );
    });

    it('should throw BadRequestException on error', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';
      const dto = new UpdateVpScoringCriterionDto();

      jest
        .spyOn(service, 'updateVpScoringCriterion')
        .mockRejectedValue(new BadRequestException('Error'));

      await expect(
        controller.updateVpScoringCriteria(tenantId, id, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeVpScoringCriterion', () => {
    it('should call service.removeVpScoringCriterion and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      const result = userVpScoringCriteriaData();

      jest
        .spyOn(service, 'removeVpScoringCriterion')
        .mockResolvedValue(result as any);

      const response = await controller.removeVpScoringCriteria(tenantId, id);

      expect(response).toEqual(result);
      expect(service.removeVpScoringCriterion).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if work schedule not found', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      jest
        .spyOn(service, 'removeVpScoringCriterion')
        .mockRejectedValue(
          new NotFoundException(
            'WorkSVpScoringCriterion with Id 672ae79c-6499-4ab3-a71a-d8a76fd68821 not found',
          ),
        );

      await expect(
        controller.removeVpScoringCriteria(tenantId, id),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
