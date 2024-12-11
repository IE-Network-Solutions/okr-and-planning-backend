import { Test, TestingModule } from '@nestjs/testing';
import { VpScoringController } from '../../controllers/vp-scoring.controller';
import { VpScoringService } from '../../services/vp-scoring.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VpScoring } from '../../entities/vp-scoring.entity';
import { mock, MockProxy } from 'jest-mock-extended';
import { Connection, QueryRunner, Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { paginationResultVpScoringData, VpScoringData } from './test-data';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateVpScoringDto } from '../../dtos/vp-scoring-dto/update-vp-scoring.dto';
import { VpScoreInstanceService } from '../../services/vp-score-instance.service';
import { VpScoringCriteriaService } from '../../services/vp-scoring-criteria.service';
import { UserVpScoringService } from '../../services/user-vp-scoring.service';

describe('VpScoringController', () => {
  let controller: VpScoringController;
  let service: VpScoringService;
  let connection: MockProxy<Connection>;
  let queryRunner: MockProxy<QueryRunner>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VpScoringController],
      providers: [
        VpScoringService,
        {
          provide: getRepositoryToken(VpScoring),
          useValue: mock<Repository<VpScoring>>(),
        },
        {
          provide: getRepositoryToken(VpScoring),
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

    controller = module.get<VpScoringController>(VpScoringController);
    service = module.get<VpScoringService>(VpScoringService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createVpScoring', () => {
    it('should call service.createVpScoring and return the result', async () => {
      const dto = VpScoringData();
      const tenantId = 'tenant-id';
      const result = VpScoringData();

      jest.spyOn(service, 'createVpScoring').mockResolvedValue(result as any);

      const req = { tenantId } as Partial<Request> & { tenantId: string };
      const response = await controller.createVpScoring(dto, tenantId);

      expect(response).toEqual(result);
      expect(service.createVpScoring).toHaveBeenCalledWith(dto, tenantId);
    });
  });

  describe('findAllVpScoreInstance', () => {
    it('should return paginated VP criteria when valid pagination params are provided', async () => {
      const mockVpScoreInstanceService = {
        findAllVpScorings: jest.fn(),
      };
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        orderBy: 'id',
        orderDirection: 'ASC',
      };
      const vpResult: Pagination<VpScoring> = paginationResultVpScoringData();
      const paginationOptions = new PaginationDto();
      jest.spyOn(service, 'findAllVpScorings').mockResolvedValue(vpResult);

      mockVpScoreInstanceService.findAllVpScorings.mockResolvedValue(
        VpScoringData(),
      );

      const result = await controller.findAllVpScorings(
        'tenant1',
        paginationDto,
      );

      expect(service.findAllVpScorings).toHaveBeenCalledWith(
        'tenant1',
        paginationDto,
      );
      expect(result).toEqual(paginationResultVpScoringData());
    });
  });

  describe('findOneVpScoring', () => {
    it('should call service.findOneVpScoring and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const result = VpScoringData();

      jest.spyOn(service, 'findOneVpScoring').mockResolvedValue(result as any);

      const response = await controller.findOneVpScoring(id);

      expect(response).toEqual(result);
      expect(service.findOneVpScoring).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if work schedule not found', async () => {
      const id = '4567';

      jest
        .spyOn(service, 'findOneVpScoring')
        .mockRejectedValue(
          new NotFoundException('WorkSVpScoring with Id 4567 not found'),
        );

      await expect(controller.findOneVpScoring(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateVpScoring', () => {
    it('should call service.updateVpScoring and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      const dto = new UpdateVpScoringDto();
      const result = VpScoringData();

      jest.spyOn(service, 'updateVpScoring').mockResolvedValue(result as any);

      const response = await controller.updateVpScoring(tenantId, id, dto);

      expect(response).toEqual(result);
      expect(service.updateVpScoring).toHaveBeenCalledWith(id, dto, tenantId);
    });

    it('should throw BadRequestException on error', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';
      const dto = new UpdateVpScoringDto();

      jest
        .spyOn(service, 'updateVpScoring')
        .mockRejectedValue(new BadRequestException('Error'));

      await expect(
        controller.updateVpScoring(tenantId, id, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeVpScoring', () => {
    it('should call service.removeVpScoring and return the result', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      const result = VpScoringData();

      jest.spyOn(service, 'removeVpScoring').mockResolvedValue(result as any);

      const response = await controller.removeVpScoring(tenantId, id);

      expect(response).toEqual(result);
      expect(service.removeVpScoring).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if work schedule not found', async () => {
      const id = '672ae79c-6499-4ab3-a71a-d8a76fd68821';
      const tenantId = '8f2e3691-423f-4f21-b676-ba3a932b7c7c';

      jest
        .spyOn(service, 'removeVpScoring')
        .mockRejectedValue(
          new NotFoundException(
            'WorkSVpScoring with Id 672ae79c-6499-4ab3-a71a-d8a76fd68821 not found',
          ),
        );

      await expect(controller.removeVpScoring(tenantId, id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
