import { NotFoundException } from '@nestjs/common';
import {
  metricTypeData,
  paginationResultMetricTypeData,
} from '../test/test.data';

export const MetricTypesService = jest.fn().mockReturnValue({
  createMetricType: jest.fn().mockResolvedValue(metricTypeData()),
  findAllMetricTypes: jest
    .fn()
    .mockResolvedValue(paginationResultMetricTypeData()),
  findOneMetricType: jest
    .fn()
    .mockImplementation((id) =>
      id === metricTypeData().id
        ? Promise.resolve(metricTypeData())
        : Promise.reject(new NotFoundException(`MetricType Not Found`)),
    ),

  updateMetricType: jest
    .fn()
    .mockImplementation((id) =>
      id === metricTypeData().id
        ? Promise.resolve(metricTypeData())
        : Promise.reject(new Error(`MetricType Not Found`)),
    ),

  removeMetricType: jest
    .fn()
    .mockImplementation((id) =>
      id === metricTypeData().id
        ? Promise.resolve(metricTypeData())
        : Promise.reject(new Error(`MetricType Not Found`)),
    ),
});
