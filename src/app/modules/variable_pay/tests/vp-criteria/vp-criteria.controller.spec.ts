import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  createVpCriteriaData,
  paginationResultVpCriteriaData,
  vpCriteriaData,
} from './test-data';
import { UpdateVpCriteriaDto } from '../../dtos/vp-criteria-dto/update-vp-criteria.dto';
import { VpCriteria } from '../../entities/vp-criteria.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { VpCriteriaController } from '../../controllers/vp-criteria.controller';
import { VpCriteriaService } from '../../services/vp-criteria.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { PaginationService } from '@root/src/core/pagination/pagination.service';

describe('VpCriteriaController', () => {
  let controller: VpCriteriaController;
  let service: VpCriteriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VpCriteriaController],
      providers: [
        VpCriteriaService,
        {
          provide: getRepositoryToken(VpCriteria),
          useValue: mock<Repository<VpCriteria>>(),
        },
        {
          provide: getRepositoryToken(VpCriteria),
          useValue: mock<Repository<VpCriteria>>(),
        },
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },
      ],
    }).compile();

    controller = module.get<VpCriteriaController>(VpCriteriaController);
    service = module.get<VpCriteriaService>(VpCriteriaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createVpCriteria', () => {
    it('should call service.createVpCriteria and return the result', async () => {
      const dto = createVpCriteriaData();
      const tenantId = 'tenant-id';
      const result = vpCriteriaData();

      jest.spyOn(service, 'createVpCriteria').mockResolvedValue(result as any);

      const req = { tenantId } as Partial<Request> & { tenantId: string };
      const response = await controller.createVpCriteria(dto, tenantId);

      expect(response).toEqual(result);
      expect(service.createVpCriteria).toHaveBeenCalledWith(dto);
    });
  });
  describe('findAllVpCriteria', () => {
    let controller: VpCriteriaController;
    let mockVpCriteriaService: { findAllVpCriteria: jest.Mock };
  
    beforeEach(() => {
      mockVpCriteriaService = {
        findAllVpCriteria: jest.fn(),
      };
  
      // Inject the mock service into the controller
      controller = new VpCriteriaController(mockVpCriteriaService as any);
    });
  
    it('should return paginated VP criteria when valid pagination params are provided', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        orderBy: 'id',
        orderDirection: 'ASC',
      };
  
      const vpResult: Pagination<VpCriteria> = paginationResultVpCriteriaData();
  
      // Mock the service method
      mockVpCriteriaService.findAllVpCriteria.mockResolvedValue(vpResult);
  
      // Call the controller method
      const result = await controller.findAllVpCriteria('tenant1', paginationDto);
  
      // Verify that the mock service was called with the correct arguments
      expect(mockVpCriteriaService.findAllVpCriteria).toHaveBeenCalledWith(
        paginationDto,
      );
  
      // Verify the result
      expect(result).toEqual(vpResult);
    });
  });
  

  describe('findOneVpCriteria', () => {
    it('should call service.findOneVpCriteria and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const result = vpCriteriaData();

      jest.spyOn(service, 'findOneVpCriteria').mockResolvedValue(result as any);

      const response = await controller.findOneVpCriteria(id);

      expect(response).toEqual(result);
      expect(service.findOneVpCriteria).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if work schedule not found', async () => {
      const id = '4567';

      jest
        .spyOn(service, 'findOneVpCriteria')
        .mockRejectedValue(
          new NotFoundException('WorkSVpCriteria with Id 4567 not found'),
        );

      await expect(controller.findOneVpCriteria(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateVpCriteria', () => {
    it('should call service.updateVpCriteria and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      const dto = new UpdateVpCriteriaDto();
      const result = vpCriteriaData();

      jest.spyOn(service, 'updateVpCriteria').mockResolvedValue(result as any);

      const response = await controller.updateVpCriteria(tenantId, id, dto);

      expect(response).toEqual(result);
      expect(service.updateVpCriteria).toHaveBeenCalledWith(id, dto);
    });

    it('should throw BadRequestException on error', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';
      const dto = new UpdateVpCriteriaDto();

      jest
        .spyOn(service, 'updateVpCriteria')
        .mockRejectedValue(new BadRequestException('Error'));

      await expect(
        controller.updateVpCriteria(tenantId, id, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeVpCriteria', () => {
    it('should call service.removeVpCriteria and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      const result = vpCriteriaData();

      jest.spyOn(service, 'removeVpCriteria').mockResolvedValue(result as any);

      const response = await controller.removeVpCriteria(tenantId, id);

      expect(response).toEqual(result);
      expect(service.removeVpCriteria).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if work schedule not found', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      jest
        .spyOn(service, 'removeVpCriteria')
        .mockRejectedValue(
          new NotFoundException(
            'WorkSVpCriteria with Id 672ae79c-6499-4ab3-a71a-d8a76fd68821 not found',
          ),
        );

      await expect(controller.removeVpCriteria(tenantId, id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
