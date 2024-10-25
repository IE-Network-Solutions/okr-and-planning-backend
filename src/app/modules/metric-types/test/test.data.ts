import { Pagination } from 'nestjs-typeorm-paginate';
import { CreateMetricTypeDto } from '../dto/create-metric-type.dto';
import { MetricType } from '../entities/metric-type.entity';
import { NAME } from '../enum/metric-type.enum';

export const metricTypeData = (): MetricType => {
  return {
    id: 'cbec99d6-41bf-405a-bb39-2458bed0538c',
    createdAt: new Date('2024-09-20T04:51:24.825Z'),
    updatedAt: new Date('2024-09-20T04:51:24.825Z'),
    deletedAt: null,
    updatedBy: 'selam',
    createdBy: 'selam',
    name: NAME.CURRENCY,
    description: 'Currency',
    tenantId: '57577865-7625-4170-a803-a73567e19216',
    keyResults: null,
  };
};

export const createMetricType = (): CreateMetricTypeDto => {
  return {
    name: NAME.MILESTONE,
    description: 'descriptiom',
  };
};
export const deleteMetricTypeData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};

export const updateMetricTypeDataReturned = () => {
  return {
    generatedMaps: [],
    raw: [],
    affected: 1,
  };
};

export const paginationResultMetricTypeData = (): Pagination<MetricType> => {
  return {
    items: [metricTypeData()],
    meta: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    },
  };
};

export const updateMetricTypeData = () => {
  return {
    id: '8988e162-940a-4ae8-94f1-bfd598d6e9fc',
    name: NAME.MILESTONE,
    description: 'descriptiom',
    keyResults: null,
    tenantId: '57577865-7625-4170-a803-a73567e19216',
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};
export const createMetricTypeDataOnCreate = () => {
  return {
    id: '8988e162-940a-4ae8-94f1-bfd598d6e9fc',
    name: NAME.MILESTONE,
    description: 'descriptiom',
    keyResults: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};

export const updateMetricTypeDataOnUpdate = () => {
  return {
    id: '8988e162-940a-4ae8-94f1-bfd598d6e9fc',
    name: NAME.MILESTONE,
    description: 'descriptiom',
    keyResults: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};

export const findOneNotFoundReturnValue = () => {
  return {
    statusCode: 404,
    message: 'MetricType with Id 4567 not found',
    error: 'Not Found',
  };
};
