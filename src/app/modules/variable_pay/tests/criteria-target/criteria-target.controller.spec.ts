import { Test, TestingModule } from '@nestjs/testing';
import { CriteriaTargetController } from '../../controllers/criteria-target.controller';
import { CriteriaTargetService } from '../../services/criteria-target.service';
import { CriteriaTarget } from '../../entities/criteria-target.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import {
  createCriteriaTargetData,
  criteriaTargetData,
  paginationResultCriteriaTargetData,
  testCreateCriteriaTargetForMultipleDto,
} from './test-data';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateCriteriaTargetDto } from '../../dtos/criteria-target-dto/update-criteria-target.dto';

describe('CriteriaTargetController', () => {
  let controller: CriteriaTargetController;
  let service: CriteriaTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CriteriaTargetController],
      providers: [
        CriteriaTargetService,
        {
          provide: getRepositoryToken(CriteriaTarget),
          useValue: mock<Repository<CriteriaTarget>>(),
        },
        {
          provide: getRepositoryToken(CriteriaTarget),
          useValue: mock<Repository<CriteriaTarget>>(),
        },
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },
      ],
    }).compile();

    controller = module.get<CriteriaTargetController>(CriteriaTargetController);
    service = module.get<CriteriaTargetService>(CriteriaTargetService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCriteriaTarget', () => {
    it('should call service.createCriteriaTarget and return the result', async () => {
      const dto = testCreateCriteriaTargetForMultipleDto();
      const tenantId = 'tenant-id';
      const result = criteriaTargetData();

      jest
        .spyOn(service, 'createCriteriaTarget')
        .mockResolvedValue(result as any);

      const req = { tenantId } as Partial<Request> & { tenantId: string };
      const response = await controller.createCriteriaTarget(dto, tenantId);

      expect(response).toEqual(result);
      expect(service.createCriteriaTarget).toHaveBeenCalledWith(dto, tenantId);
    });
  });

  describe('findAllCriteriaTargets', () => {
   
    let mockCriteriaTargetService: { findAllCriteriaTargets: jest.Mock };
  
    beforeEach(() => {
      // Define the mock service
      mockCriteriaTargetService = {
        findAllCriteriaTargets: jest.fn(),
      };
  
      // Inject the mock service into the controller
      controller = new CriteriaTargetController(mockCriteriaTargetService as any);
    });
  
    it('should return paginated criteria targets when valid pagination params are provided', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        orderBy: 'id',
        orderDirection: 'ASC',
      };
  
      const vpResult: Pagination<CriteriaTarget> = paginationResultCriteriaTargetData();
  
      // Mock the service method
      mockCriteriaTargetService.findAllCriteriaTargets.mockResolvedValue(vpResult);
  
      // Call the controller method
      const result = await controller.findAllCriteriaTargets('tenant1', paginationDto);
  
      // Verify that the mock service was called with the correct arguments
      expect(mockCriteriaTargetService.findAllCriteriaTargets).toHaveBeenCalledWith(
        'tenant1',
        paginationDto,
      );
  
      // Verify the result
      expect(result).toEqual(vpResult);
    });
  });
  

  describe('findOneCriteriaTarget', () => {
    it('should call service.findOneCriteriaTarget and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const result = criteriaTargetData();

      jest
        .spyOn(service, 'findOneCriteriaTarget')
        .mockResolvedValue(result as any);

      const response = await controller.findOneCriteriaTarget(id);

      expect(response).toEqual(result);
      expect(service.findOneCriteriaTarget).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if work schedule not found', async () => {
      const id = '4567';

      jest
        .spyOn(service, 'findOneCriteriaTarget')
        .mockRejectedValue(
          new NotFoundException('WorkSCriteriaTarget with Id 4567 not found'),
        );

      await expect(controller.findOneCriteriaTarget(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCriteriaTarget', () => {
    it('should call service.updateCriteriaTarget and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      const dto = new UpdateCriteriaTargetDto();
      const result = criteriaTargetData();

      jest
        .spyOn(service, 'updateCriteriaTarget')
        .mockResolvedValue(result as any);

      const response = await controller.updateCriteriaTarget(tenantId, id, dto);

      expect(response).toEqual(result);
      expect(service.updateCriteriaTarget).toHaveBeenCalledWith(
        id,
        dto,
        tenantId,
      );
    });

    it('should throw BadRequestException on error', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';
      const dto = new UpdateCriteriaTargetDto();

      jest
        .spyOn(service, 'updateCriteriaTarget')
        .mockRejectedValue(new BadRequestException('Error'));

      await expect(
        controller.updateCriteriaTarget(tenantId, id, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeCriteriaTarget', () => {
    it('should call service.removeCriteriaTarget and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      const result = criteriaTargetData();

      jest
        .spyOn(service, 'removeCriteriaTarget')
        .mockResolvedValue(result as any);

      const response = await controller.removeCriteriaTarget(tenantId, id);

      expect(response).toEqual(result);
      expect(service.removeCriteriaTarget).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if work schedule not found', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      jest
        .spyOn(service, 'removeCriteriaTarget')
        .mockRejectedValue(
          new NotFoundException(
            'WorkSCriteriaTarget with Id 672ae79c-6499-4ab3-a71a-d8a76fd68821 not found',
          ),
        );

      await expect(
        controller.removeCriteriaTarget(tenantId, id),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
