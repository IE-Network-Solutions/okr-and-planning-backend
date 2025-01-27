import { Test } from '@nestjs/testing';
import { MetricTypesController } from './metric-types.controller';
import { MetricTypesService } from './metric-types.service';
import { MetricType } from './entities/metric-type.entity';
import {
  createMetricType,
  metricTypeData,
  paginationResultMetricTypeData,
  updateMetricTypeData,
} from './test/test.data';
import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';

jest.mock('./metric-types.service');

describe('metricTypeController', () => {
  let metricTypeController: MetricTypesController;
  let metricTypeService: MetricTypesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [MetricTypesController],
      providers: [MetricTypesService],
    }).compile();
    metricTypeController = moduleRef.get<MetricTypesController>(
      MetricTypesController,
    );
    metricTypeService = moduleRef.get<MetricTypesService>(MetricTypesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    describe('when createmetricType is called', () => {
      let request: Request;
      let metricType: MetricType;

      beforeEach(async () => {
        request = {
          tenantId: '57577865-7625-4170-a803-a73567e19216',
        } as any;
        metricType = await metricTypeController.createMetricType(
          request,
          createMetricType(),
        );
      });

      test('then it should call metricTypeServic', () => {
        expect(metricTypeService.createMetricType).toHaveBeenCalledWith(
          createMetricType(),
          request['tenantId'],
        );
      });

      test('then it should return a metricType', () => {
        expect(metricType).toEqual(metricTypeData());
      });
    });
  });

  describe('findAll', () => {
    describe('when findAllmetricType is called', () => {
      let request: Request;
      beforeEach(async () => {
        request = {
          tenantId: '57577865-7625-4170-a803-a73567e19216',
        } as any;
        await metricTypeController.findAllMetricTypes(
          request,
          paginationOptions(),
        );
      });

      test('then it should call metricTypeService', () => {
        expect(metricTypeService.findAllMetricTypes).toHaveBeenCalledWith(
          paginationOptions(),
          request['tenantId'],
        );
      });

      test('then is should return a metricType', async () => {
        expect(
          await metricTypeController.findAllMetricTypes(
            request,
            paginationOptions(),
          ),
        ).toEqual(paginationResultMetricTypeData());
      });
    });
  });

  describe('findOne', () => {
    describe('when findOnemetricType is called', () => {
      let metricType: MetricType;

      beforeEach(async () => {
        metricType = await metricTypeController.findOneMetricType(
          metricTypeData().id,
        );
      });

      test('then it should call metricTypeervice', () => {
        expect(metricTypeService.findOneMetricType).toHaveBeenCalledWith(
          metricTypeData().id,
        );
      });

      test('then it should return metricType', () => {
        expect(metricType).toEqual(metricTypeData());
      });
    });
  });

  describe('update', () => {
    let request: Request;
    describe('when updatemetricType is called', () => {
      let metricType: MetricType;
      beforeEach(async () => {
        request = {
          tenantId: '57577865-7625-4170-a803-a73567e19216',
        } as any;
        metricType = await metricTypeController.updateMetricType(
          request['tenantId'],
          metricTypeData().id,
          updateMetricTypeData(),
        );
      });

      test('then it should call metricTypeService', () => {
        expect(metricTypeService.updateMetricType).toHaveBeenCalledWith(
          metricTypeData().id,
          updateMetricTypeData(),
        );
      });

      test('then it should return a metricType', () => {
        expect(metricType).toEqual(metricTypeData());
      });
    });
  });

  describe('remove', () => {
    describe('when removemetricType is called', () => {
      let request: Request;
      beforeEach(async () => {
        request = {
          tenantId: '57577865-7625-4170-a803-a73567e19216',
        } as any;
        await metricTypeController.removeMetricType(
          request,
          metricTypeData().id,
        );
      });

      test('then it should call metricTypeServic', () => {
        expect(metricTypeService.removeMetricType).toHaveBeenCalledWith(
          metricTypeData().id,
        );
      });

      test('then it should return a metricType', async () => {
        expect(
          await metricTypeController.removeMetricType(
            request['tenantId'],
            metricTypeData().id,
          ),
        ).toEqual(metricTypeData());
      });
    });
  });
});
