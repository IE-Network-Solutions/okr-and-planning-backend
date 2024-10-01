// import { Test } from '@nestjs/testing';
// import { KeyResult } from './entities/key-result.entity';
// import { KeyResultsController } from './key-results.controller';
// import { KeyResultsService } from './key-results.service';
// import {
//   createKeyResulteData,
//   keyResultData,
//   paginationResultkeyResultData,
//   updatekeyResultData,
// } from './test/test.data';
// import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';

// jest.mock('./key-results.service');

// describe('keyresultController', () => {
//   let keyResultController: KeyResultsController;
//   let keyResultService: KeyResultsService;

//   beforeEach(async () => {
//     const moduleRef = await Test.createTestingModule({
//       imports: [],
//       controllers: [KeyResultsController],
//       providers: [KeyResultsService],
//     }).compile();
//     keyResultController =
//       moduleRef.get<KeyResultsController>(KeyResultsController);
//     keyResultService = moduleRef.get<KeyResultsService>(KeyResultsService);
//     jest.clearAllMocks();
//   });

//   describe('create', () => {
//     describe('when createkeyResult is called', () => {
//       let request: Request;
//       let keyResult: KeyResult;

//       beforeEach(async () => {
//         request = {
//           tenantId: '57577865-7625-4170-a803-a73567e19216',
//         } as any;
//         keyResult = await keyResultController.createkeyResult(
//           request,
//           createKeyResulteData(),
//         );
//       });

//       test('then it should call keyResultServic', () => {
//         expect(keyResultService.createkeyResult).toHaveBeenCalledWith(
//           createKeyResulteData(),
//           request['tenantId'],
//         );
//       });

//       test('then it should return a keyResult', () => {
//         expect(keyResult).toEqual(keyResultData());
//       });
//     });
//   });

//   describe('findAll', () => {
//     describe('when findAllkeyResult is called', () => {
//       let request: Request;
//       beforeEach(async () => {
//         request = {
//           tenantId: '57577865-7625-4170-a803-a73567e19216',
//         } as any;
//         await keyResultController.findAllkeyResults(
//           request,
//           paginationOptions(),
//         );
//       });

//       test('then it should call keyResultService', () => {
//         expect(keyResultService.findAllkeyResults).toHaveBeenCalledWith(
//           paginationOptions(),
//           request['tenantId'],
//         );
//       });

//       test('then is should return a keyResult', async () => {
//         expect(
//           await keyResultController.findAllkeyResults(
//             request,
//             paginationOptions(),
//           ),
//         ).toEqual(paginationResultkeyResultData());
//       });
//     });
//   });

//   describe('findOne', () => {
//     describe('when findOnekeyResult is called', () => {
//       let keyResult: KeyResult;

//       beforeEach(async () => {
//         keyResult = await keyResultController.findOnekeyResult(
//           keyResultData().id,
//         );
//       });

//       test('then it should call keyResultervice', () => {
//         expect(keyResultService.findOnekeyResult).toHaveBeenCalledWith(
//           keyResultData().id,
//         );
//       });

//       test('then it should return keyResult', () => {
//         expect(keyResult).toEqual(keyResultData());
//       });
//     });
//   });

//   describe('update', () => {
//     let request: Request;
//     describe('when updatekeyResult is called', () => {
//       let keyResult: KeyResult;
//       beforeEach(async () => {
//         request = {
//           tenantId: '57577865-7625-4170-a803-a73567e19216',
//         } as any;
//         keyResult = await keyResultController.updatekeyResult(
//           request['tenantId'],
//           keyResultData().id,
//           updatekeyResultData(),
//         );
//       });

//       test('then it should call keyResultService', () => {
//         expect(keyResultService.updatekeyResult).toHaveBeenCalledWith(
//           keyResultData().id,
//           updatekeyResultData(),
//         );
//       });

//       test('then it should return a keyResult', () => {
//         expect(keyResult).toEqual(keyResultData());
//       });
//     });
//   });

//   describe('remove', () => {
//     describe('when removekeyResult is called', () => {
//       let request: Request;
//       beforeEach(async () => {
//         request = {
//           tenantId: '57577865-7625-4170-a803-a73567e19216',
//         } as any;
//         await keyResultController.removekeyResult(request, keyResultData().id);
//       });

//       test('then it should call keyResultServic', () => {
//         expect(keyResultService.removekeyResult).toHaveBeenCalledWith(
//           keyResultData().id,
//         );
//       });

//       test('then it should return a keyResult', async () => {
//         expect(
//           await keyResultController.removekeyResult(
//             request['tenantId'],
//             keyResultData().id,
//           ),
//         ).toEqual(keyResultData());
//       });
//     });
//   });
// });

import { Test } from '@nestjs/testing';
import { KeyResultsController } from './key-results.controller';
import { KeyResultsService } from './key-results.service';

jest.mock('./key-results.service');

describe('ObjectiveController', () => {
  let keyResultsController: KeyResultsController;
  let keyResultsService: KeyResultsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [KeyResultsController],
      providers: [KeyResultsService],
    }).compile();

    keyResultsController =
      moduleRef.get<KeyResultsController>(KeyResultsController);
    keyResultsService = moduleRef.get<KeyResultsService>(KeyResultsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(keyResultsController).toBeDefined();
  });
});
