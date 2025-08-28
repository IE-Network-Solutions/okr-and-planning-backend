import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckInRuleService } from './check-in-rule.service';
import { CheckInRule } from '../entities/check-in-rule.entity';
import { CreateCheckInRuleDto } from '../dto/create-check-in-rule.dto';
import { UpdateCheckInRuleDto } from '../dto/update-check-in-rule.dto';
import { AppliesTo } from '../enum/applies-to.enum';
import { Operation } from '../enum/operation.enum';
import { Action } from '../enum/action.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CheckInRuleService', () => {
  let service: CheckInRuleService;
  let repository: Repository<CheckInRule>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckInRuleService,
        {
          provide: getRepositoryToken(CheckInRule),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CheckInRuleService>(CheckInRuleService);
    repository = module.get<Repository<CheckInRule>>(getRepositoryToken(CheckInRule));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateCheckInRuleDto = {
      name: 'Test Rule',
      description: 'Test Description',
      appliesTo: AppliesTo.PLAN,
      planningPeriodId: 'uuid-1',
      timeBased: true,
      achievementBased: false,
      frequency: 7,
      operation: Operation.GREATER_THAN,
      tenantId: 'tenant-1',
      categoryId: 'category-uuid-1',
      action: Action.APPRECIATION,
    };

    it('should create a check-in rule successfully', async () => {
      const mockEntity = { ...createDto, id: 'uuid-2' } as CheckInRule;
      mockRepository.create.mockReturnValue(mockEntity);
      mockRepository.save.mockResolvedValue(mockEntity);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(service['mapToResponseDto'](mockEntity));
    });


  });

  describe('findAll', () => {
    it('should return all check-in rules for a tenant', async () => {
      const mockRules = [
        { id: 'uuid-1', tenantId: 'tenant-1' } as CheckInRule,
        { id: 'uuid-2', tenantId: 'tenant-1' } as CheckInRule,
      ];
      mockRepository.find.mockResolvedValue(mockRules);

      const result = await service.findAll('tenant-1');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        relations: ['planningPeriod'],
      });
      expect(result).toHaveLength(2);
    });
  });



  describe('update', () => {
    const updateDto: UpdateCheckInRuleDto = {
      name: 'Updated Rule',
      frequency: 14,
    };

    it('should update a check-in rule successfully', async () => {
      const existingRule = { id: 'uuid-1', tenantId: 'tenant-1' } as CheckInRule;
      const updatedRule = { ...existingRule, ...updateDto };
      mockRepository.findOne.mockResolvedValue(existingRule);
      mockRepository.save.mockResolvedValue(updatedRule);

      const result = await service.update('uuid-1', updateDto, 'tenant-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1', tenantId: 'tenant-1' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedRule);
      expect(result).toEqual(service['mapToResponseDto'](updatedRule));
    });

    it('should throw NotFoundException when rule not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('uuid-1', updateDto, 'tenant-1')).rejects.toThrow(
        new NotFoundException('Check-in rule with ID uuid-1 not found'),
      );
    });
  });

  describe('remove', () => {
    it('should remove a check-in rule successfully', async () => {
      const mockRule = { id: 'uuid-1', tenantId: 'tenant-1' } as CheckInRule;
      mockRepository.findOne.mockResolvedValue(mockRule);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove('uuid-1', 'tenant-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1', tenantId: 'tenant-1' },
      });
      expect(mockRepository.softDelete).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException when rule not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('uuid-1', 'tenant-1')).rejects.toThrow(
        new NotFoundException('Check-in rule with ID uuid-1 not found'),
      );
    });
  });
}); 