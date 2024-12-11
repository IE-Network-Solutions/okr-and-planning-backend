import { Pagination } from 'nestjs-typeorm-paginate';

import { SourceService } from '../../enums/sourceService.enum';
import { CriteriaTarget } from '../../entities/criteria-target.entity';
import { CreateCriteriaTargetDto } from '../../dtos/criteria-target-dto/create-criteria-target.dto';
import {
  CreateCriteriaTargetForMultipleDto,
  TargetDto,
} from '../../dtos/criteria-target-dto/create-vp-criteria-bulk-dto';
import { UpdateCriteriaTargetDto } from '../../dtos/criteria-target-dto/update-criteria-target.dto';

export const criteriaTargetData = (): CriteriaTarget => {
  return {
    id: '672ae79c-6499-4ab3-a71a-d8a76fd68821',
    departmentId: '3b1d8333-40a7-4b23-8e54-6345a254288a',
    vpCriteria: null,
    target: 15,
    vpCriteriaId: '740c1ee2-f8b7-4a22-aff8-2766a8306627',
    month: 'month-one',
    tenantId: '4697235a-007a-418b-b3d4-7ec5ebe8f8ab',
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
  };
};

export const createCriteriaTargetData = (): CreateCriteriaTargetDto => {
  return {
    departmentId: '3b1d8333-40a7-4b23-8e54-6345a254288a',
    target: 15,
    vpCriteriaId: '740c1ee2-f8b7-4a22-aff8-2766a8306627',
    month: 'month-one',
    createdBy: '4697235a-007a-418b-b3d4-7ec5ebe8f8ab',
  };
};

export const updateCriteriaTargetData = (): UpdateCriteriaTargetDto => {
  return {
    departmentId: '3b1d8333-40a7-4b23-8e54-6345a254288a',
    target: 15,
    vpCriteriaId: '740c1ee2-f8b7-4a22-aff8-2766a8306627',
    month: 'month-one',
    updatedBy: '4697235a-007a-418b-b3d4-7ec5ebe8f8ab',
  };
};
export const paginationResultCriteriaTargetData =
  (): Pagination<CriteriaTarget> => {
    return {
      items: [criteriaTargetData()],
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    };
  };

export const deleteCriteriaTargetData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};

export const testCreateCriteriaTargetForMultipleDto = () => {
  return {
    departmentId: 'a1234567-b89c-123d-456e-789f12345678',
    vpCriteriaId: 'b2345678-c91d-234e-567f-890g23456789',
    target: [{ target: 85.0, month: 'April' }],

    createdBy: 'c3456789-d01e-345f-678g-901h34567890',
  };
};

export const testTargetDto = () => {
  return {
    target: 85.0,
    month: 'April',
  };
};
