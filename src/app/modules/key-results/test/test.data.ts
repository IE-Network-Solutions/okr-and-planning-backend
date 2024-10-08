import { Pagination } from 'nestjs-typeorm-paginate';
import { CreateKeyResultDto } from '../dto/create-key-result.dto';
import { KeyResult } from '../entities/key-result.entity';

export const keyResultData = (): KeyResult => {
  return {
    id: '8988e162-940a-4ae8-94f1-bfd598d6e9fc',
    objectiveId: '60ae2e8d-2904-40d0-ba3d-7e5ec7625774',

    title: 'key result',
    lastUpdateValue: 0,
    description: 'key result',

    deadline: new Date('2022-10-22 07:11:42'),

    metricTypeId: '16a72a54-0677-4c31-a27d-0f01ac430efa',
    initialValue: 0,
    targetValue: 0,
    weight: 10,
    currentValue: 0,
    progress: 0,
    tenantId: '29259e8c-d89e-4bda-a5d1-58dfbaa48388',
    objective: null,
    milestones: null,

    metricType: null,

    obj: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};

export const createKeyResulteData = (): CreateKeyResultDto => {
  return {
    objectiveId: '60ae2e8d-2904-40d0-ba3d-7e5ec7625774',

    title: 'key result',

    description: 'key result',

    deadline: new Date('2022-10-22 07:11:42'),

    metricTypeId: '16a72a54-0677-4c31-a27d-0f01ac430efa',
    initialValue: 0,
    targetValue: 0,
    weight: 10,
    currentValue: 0,
    progress: 0,

    milestones: null,
  };
};
export const deleteKeyResultData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};

export const updateKeyResultDataReturned = () => {
  return {
    generatedMaps: [],
    raw: [],
    affected: 1,
  };
};

export const paginationResultkeyResultData = (): Pagination<KeyResult> => {
  return {
    items: [keyResultData()],
    meta: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    },
  };
};

export const updatekeyResultData = () => {
  return {
    id: '8988e162-940a-4ae8-94f1-bfd598d6e9fc',
    objectiveId: '60ae2e8d-2904-40d0-ba3d-7e5ec7625774',

    title: 'key result',

    description: 'key result',

    deadline: new Date('2022-10-22 07:11:42'),

    metricTypeId: '16a72a54-0677-4c31-a27d-0f01ac430efa',
    initialValue: 0,
    targetValue: 0,
    weight: 10,
    currentValue: 0,
    progress: 0,
    tenantId: '29259e8c-d89e-4bda-a5d1-58dfbaa48388',
    objective: null,
    milestones: null,

    metricType: null,

    obj: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};
export const createkeyResultDataOnCreate = () => {
  return {
    id: '8988e162-940a-4ae8-94f1-bfd598d6e9fc',
    objectiveId: '60ae2e8d-2904-40d0-ba3d-7e5ec7625774',

    title: 'key result',

    description: 'key result',

    deadline: new Date('2022-10-22 07:11:42'),

    metricTypeId: '16a72a54-0677-4c31-a27d-0f01ac430efa',
    initialValue: 0,
    targetValue: 0,
    weight: 10,
    currentValue: 0,
    progress: 0,
    tenantId: '29259e8c-d89e-4bda-a5d1-58dfbaa48388',
    objective: null,
    milestones: null,

    metricType: null,

    obj: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};

export const updatekeyResultDataOnUpdate = () => {
  return {
    id: '8988e162-940a-4ae8-94f1-bfd598d6e9fc',
    objectiveId: '60ae2e8d-2904-40d0-ba3d-7e5ec7625774',

    title: 'key result',

    description: 'key result',

    deadline: new Date('2022-10-22 07:11:42'),

    metricTypeId: '16a72a54-0677-4c31-a27d-0f01ac430efa',
    initialValue: 0,
    targetValue: 0,
    weight: 10,
    currentValue: 0,
    progress: 0,
    tenantId: '29259e8c-d89e-4bda-a5d1-58dfbaa48388',
    objective: null,
    milestones: null,

    metricType: null,

    obj: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};

export const findOneNotFoundReturnValue = () => {
  return {
    statusCode: 404,
    message: 'keyResult with Id 4567 not found',
    error: 'Not Found',
  };
};
