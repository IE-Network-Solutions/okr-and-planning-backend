// import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';
// import { ObjectiveController } from './objective.controller';
// import { ObjectiveService } from './services/objective.service';
// import { Test } from '@nestjs/testing';
// import { Objective } from './entities/objective.entity';
// import {
//   createobjectiveData,
//   objectiveData,
//   paginationResultObjectiveData,
//   updateObjectiveData,
// } from './test/objective.data';
// jest.mock('./services/objective.service');

// describe('ObjectiveController', () => {
//   let objectiveController: ObjectiveController;
//   let objectiveService: ObjectiveService;

//   beforeEach(async () => {
//     const moduleRef = await Test.createTestingModule({
//       imports: [],
//       controllers: [ObjectiveController],
//       providers: [ObjectiveService],
//     }).compile();
//     objectiveController =
//       moduleRef.get<ObjectiveController>(ObjectiveController);
//     objectiveService = moduleRef.get<ObjectiveService>(ObjectiveService);
//     jest.clearAllMocks();

//     it('should be defined', () => {
//       expect(objectiveController).toBeDefined();
//     });
//   });

//   // describe('create', () => {
//   //   describe('when createObjective is called', () => {
//   //     let request: Request;
//   //     let objective: Objective;

//   //     beforeEach(async () => {
//   //       request = {
//   //         tenantId: '57577865-7625-4170-a803-a73567e19216',
//   //       } as any;
//   //       objective = await objectiveController.createObjective(
//   //         request,
//   //         createobjectiveData(),
//   //       );
//   //     });

//   //     test('then it should call objectiveService', () => {
//   //       expect(objectiveService.createObjective).toHaveBeenCalledWith(
//   //         createobjectiveData(),
//   //         request['tenantId'],
//   //       );
//   //     });

//   //     test('then it should return a objective', () => {
//   //       expect(objective).toEqual(objectiveData());
//   //     });
//   //   });
//   // });

//   // describe('findAll', () => {
//   //   describe('when findAllobjective is called', () => {
//   //     let request: Request;
//   //     beforeEach(async () => {
//   //       request = {
//   //         tenantId: '57577865-7625-4170-a803-a73567e19216',
//   //       } as any;
//   //       await objectiveController.findAllObjectives(
//   //         request,
//   //         objectiveData().userId,

//   //         paginationOptions(),
//   //       );
//   //     });

//   //     test('then it should call objectiveService', () => {
//   //       expect(objectiveService.findAllObjectives).toHaveBeenCalledWith(
//   //         objectiveData().userId,
//   //         request['tenantId'],
//   //         paginationOptions(),
//   //       );
//   //     });

//   //     test('then is should return a objective', async () => {
//   //       expect(
//   //         await objectiveController.findAllObjectives(
//   //           request,
//   //           objectiveData().userId,
//   //           paginationOptions(),
//   //         ),
//   //       ).toEqual(paginationResultObjectiveData());
//   //     });
//   //   });
//   // });

//   // describe('findOne', () => {
//   //   describe('when findOneObjective is called', () => {
//   //     let objective: Objective;

//   //     beforeEach(async () => {
//   //       objective = await objectiveController.findOneObjective(
//   //         objectiveData().id,
//   //       );
//   //     });

//   //     test('then it should call objectiveervice', () => {
//   //       expect(objectiveService.findOneObjective).toHaveBeenCalledWith(
//   //         objectiveData().id,
//   //       );
//   //     });

//   //     test('then it should return objective', () => {
//   //       expect(objective).toEqual(objectiveData());
//   //     });
//   //   });
//   // });

//   // describe('update', () => {
//   //   let request: Request;
//   //   describe('when updateObjective is called', () => {
//   //     let objective: Objective;
//   //     beforeEach(async () => {
//   //       request = {
//   //         tenantId: '57577865-7625-4170-a803-a73567e19216',
//   //       } as any;
//   //       objective = await objectiveController.updateObjective(
//   //         request['tenantId'],
//   //         objectiveData().id,
//   //         updateObjectiveData(),
//   //       );
//   //     });

//   //     test('then it should call objectiveService', () => {
//   //       expect(objectiveService.updateObjective).toHaveBeenCalledWith(
//   //         objectiveData().id,
//   //         updateObjectiveData(),
//   //         request['tenantId'],
//   //       );
//   //     });

//   //     test('then it should return a objective', () => {
//   //       expect(objective).toEqual(objectiveData());
//   //     });
//   //   });
//   // });

//   // describe('remove', () => {
//   //   describe('when removeObjective is called', () => {
//   //     let request: Request;
//   //     beforeEach(async () => {
//   //       request = {
//   //         tenantId: '57577865-7625-4170-a803-a73567e19216',
//   //       } as any;
//   //       await objectiveController.removeObjective(request, objectiveData().id);
//   //     });

//   //     test('then it should call objectiveService', () => {
//   //       expect(objectiveService.removeObjective).toHaveBeenCalledWith(
//   //         objectiveData().id,
//   //       );
//   //     });

//   //     test('then it should return a objective', async () => {
//   //       expect(
//   //         await objectiveController.removeObjective(
//   //           request['tenantId'],
//   //           objectiveData().id,
//   //         ),
//   //       ).toEqual(objectiveData());
//   //     });
//   //   });
//   // });
// });

import { Test } from '@nestjs/testing';
import { ObjectiveController } from './objective.controller';
import { ObjectiveService } from './services/objective.service';
import { OKRDashboardService } from './services/okr-dashbord.service';
import { mock } from 'jest-mock-extended';
import { OKRCalculationService } from './services/okr-calculation.service';
import { EncryptionService } from '@root/src/core/services/encryption.service';

jest.mock('./services/objective.service'); // Mock the service

describe('ObjectiveController', () => {
  let objectiveController: ObjectiveController;
  let objectiveService: ObjectiveService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [ObjectiveController],
      providers: [
        ObjectiveService,
        {
          provide: OKRDashboardService,
          useValue: mock<OKRDashboardService>(),
        },
        {
          provide: OKRCalculationService,
          useValue: mock<OKRCalculationService>(),
        },
        {
          provide: EncryptionService,
          useValue: mock<EncryptionService>(),
        },
      ],
    }).compile();

    objectiveController =
      moduleRef.get<ObjectiveController>(ObjectiveController);
    objectiveService = moduleRef.get<ObjectiveService>(ObjectiveService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(objectiveController).toBeDefined();
  });
});
