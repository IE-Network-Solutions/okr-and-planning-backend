import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'jest-mock-extended';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { VpScoreInstanceController } from '../../controllers/vp-score-instance.controller';
import { VpScoreInstanceService } from '../../services/vp-score-instance.service';
import { VpScoreInstance } from '../../entities/vp-score-instance.entity';
import {
  paginationResultUserVpScoringInstanceData,
  userVpScoringInstanceData,
} from './test-data';
import { UpdateVpScoreInstanceDto } from '../../dtos/vp-score-instance-dto/update-vp-score-instance.dto';
import { GetFromOrganizatiAndEmployeInfoService } from '../../../objective/services/get-data-from-org.service';
import { VpCriteriaService } from '../../services/vp-criteria.service';
import { CriteriaTargetService } from '../../services/criteria-target.service';

describe('VpScoreInstanceController', () => {
  let controller: VpScoreInstanceController;
  let service: VpScoreInstanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VpScoreInstanceController],
      providers: [
        VpScoreInstanceService,
        {
          provide: getRepositoryToken(VpScoreInstance),
          useValue: mock<Repository<VpScoreInstance>>(),
        },
        {
          provide: getRepositoryToken(VpScoreInstance),
          useValue: mock<Repository<VpScoreInstance>>(),
        },
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
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

    controller = module.get<VpScoreInstanceController>(
      VpScoreInstanceController,
    );
    service = module.get<VpScoreInstanceService>(VpScoreInstanceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createVpScoreInstance', () => {
    it('should call service.createVpScoreInstance and return the result', async () => {
      const dto = userVpScoringInstanceData();
      const tenantId = 'tenant-id';
      const result = userVpScoringInstanceData();

      jest
        .spyOn(service, 'createVpScoreInstance')
        .mockResolvedValue(result as any);

      const req = { tenantId } as Partial<Request> & { tenantId: string };
      const response = await controller.createVpScoreInstance(dto, tenantId);

      expect(response).toEqual(result);
      expect(service.createVpScoreInstance).toHaveBeenCalledWith(dto, tenantId);
    });
  });

  describe('findAllVpScoreInstance', () => {
    it('should return paginated VP criteria when valid pagination params are provided', async () => {
      const mockVpScoreInstanceService = {
        findAllVpScoreInstance: jest.fn(),
      };
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        orderBy: 'id',
        orderDirection: 'ASC',
      };
      const vpResult: Pagination<VpScoreInstance> = paginationResultUserVpScoringInstanceData();
      const paginationOptions = new PaginationDto();
      jest.spyOn(service, 'findAllVpScoreInstances').mockResolvedValue(vpResult);
  
      mockVpScoreInstanceService.findAllVpScoreInstance.mockResolvedValue(userVpScoringInstanceData());
  
      const result = await controller.findAllVpScoreInstances(
        'tenant1',
        null, // Pass null as the second argument
        paginationDto,
      );
  
      expect(service.findAllVpScoreInstances).toHaveBeenCalledWith(
        'tenant1',
        null, // Expect null as the second argument
        paginationDto,
      );
      expect(result).toEqual(paginationResultUserVpScoringInstanceData());
    });
  });

  describe('findOneVpScoreInstance', () => {
    it('should call service.findOneVpScoreInstance and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = 'tenant-id';

      const result = userVpScoringInstanceData();

      jest
        .spyOn(service, 'findOneVpScoreInstance')
        .mockResolvedValue(result as any);

      const response = await controller.findOneVpScoreInstance(id);

      expect(response).toEqual(result);
      expect(service.findOneVpScoreInstance).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if work schedule not found', async () => {
      const id = '4567';
      const tenantId = 'tenant-id';

      jest
        .spyOn(service, 'findOneVpScoreInstance')
        .mockRejectedValue(
          new NotFoundException('WorkSVpScoreInstance with Id 4567 not found'),
        );

      await expect(controller.findOneVpScoreInstance(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateVpScoreInstance', () => {
    it('should call service.updateVpScoreInstance and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      const dto = new UpdateVpScoreInstanceDto();
      const result = userVpScoringInstanceData();

      jest
        .spyOn(service, 'updateVpScoreInstance')
        .mockResolvedValue(result as any);

      const response = await controller.updateVpScoreInstance(
        tenantId,
        id,
        dto,
      );

      expect(response).toEqual(result);
      expect(service.updateVpScoreInstance).toHaveBeenCalledWith(
        id,
        dto,
        tenantId,
      );
    });

    it('should throw BadRequestException on error', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';
      const dto = new UpdateVpScoreInstanceDto();

      jest
        .spyOn(service, 'updateVpScoreInstance')
        .mockRejectedValue(new BadRequestException('Error'));

      await expect(
        controller.updateVpScoreInstance(tenantId, id, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeVpScoreInstance', () => {
    it('should call service.removeVpScoreInstance and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      const result = userVpScoringInstanceData();

      jest
        .spyOn(service, 'removeVpScoreInstance')
        .mockResolvedValue(result as any);

      const response = await controller.removeVpScoreInstance(tenantId, id);

      expect(response).toEqual(result);
      expect(service.removeVpScoreInstance).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if work schedule not found', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      jest
        .spyOn(service, 'removeVpScoreInstance')
        .mockRejectedValue(
          new NotFoundException(
            'WorkSVpScoreInstance with Id 672ae79c-6499-4ab3-a71a-d8a76fd68821 not found',
          ),
        );

      await expect(
        controller.removeVpScoreInstance(tenantId, id),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
