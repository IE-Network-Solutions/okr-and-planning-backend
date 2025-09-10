import { Test, TestingModule } from '@nestjs/testing';
import { CheckInRuleController } from './check-in-rule.controller';
import { CheckInRuleService } from '../services/check-in-rule.service';
import { CreateCheckInRuleDto } from '../dto/create-check-in-rule.dto';
import { UpdateCheckInRuleDto } from '../dto/update-check-in-rule.dto';
import { CheckInRuleResponseDto } from '../dto/check-in-rule-response.dto';
import { AppliesTo } from '../enum/applies-to.enum';
import { Operation } from '../enum/operation.enum';
import { Action } from '../enum/action.enum';

describe('CheckInRuleController', () => {
  let controller: CheckInRuleController;
  let service: CheckInRuleService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckInRuleController],
      providers: [
        {
          provide: CheckInRuleService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CheckInRuleController>(CheckInRuleController);
    service = module.get<CheckInRuleService>(CheckInRuleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    const mockResponse: CheckInRuleResponseDto = {
      id: 'uuid-2',
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a check-in rule', async () => {
      mockService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findAll', () => {
    const mockRules: CheckInRuleResponseDto[] = [
      {
        id: 'uuid-1',
        name: 'Rule 1',
        appliesTo: AppliesTo.PLAN,
        planningPeriodId: 'uuid-1',
        timeBased: true,
        achievementBased: false,
        frequency: 7,
        operation: Operation.GREATER_THAN,
        tenantId: 'tenant-1',
        categoryId: 'category-uuid-1',
        action: Action.APPRECIATION,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'uuid-2',
        name: 'Rule 2',
        appliesTo: AppliesTo.REPORT,
        planningPeriodId: 'uuid-2',
        timeBased: false,
        achievementBased: true,
        frequency: 14,
        operation: Operation.LESS_THAN,
        tenantId: 'tenant-1',
        categoryId: 'category-uuid-2',
        action: Action.REPRIMAND,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all check-in rules for a tenant', async () => {
      mockService.findAll.mockResolvedValue(mockRules);

      const result = await controller.findAll('tenant-1');

      expect(service.findAll).toHaveBeenCalledWith('tenant-1');
      expect(result).toEqual(mockRules);
    });
  });

  describe('update', () => {
    const updateDto: UpdateCheckInRuleDto = {
      name: 'Updated Rule',
      frequency: 14,
    };

    const mockUpdatedRule: CheckInRuleResponseDto = {
      id: 'uuid-1',
      name: 'Updated Rule',
      appliesTo: AppliesTo.PLAN,
      planningPeriodId: 'uuid-1',
      timeBased: true,
      achievementBased: false,
      frequency: 14,
      operation: Operation.GREATER_THAN,
      tenantId: 'tenant-1',
      categoryId: 'category-uuid-1',
      action: Action.APPRECIATION,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update a check-in rule', async () => {
      mockService.update.mockResolvedValue(mockUpdatedRule);

      const result = await controller.update('uuid-1', updateDto, 'tenant-1');

      expect(service.update).toHaveBeenCalledWith('uuid-1', updateDto, 'tenant-1');
      expect(result).toEqual(mockUpdatedRule);
    });
  });

  describe('remove', () => {
    it('should remove a check-in rule', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('uuid-1', 'tenant-1');

      expect(service.remove).toHaveBeenCalledWith('uuid-1', 'tenant-1');
    });
  });
}); 