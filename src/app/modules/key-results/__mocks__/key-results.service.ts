import { NotFoundException } from '@nestjs/common';
import {
  keyResultData,
  paginationResultkeyResultData,
} from '../test/test.data';

export const KeyResultsService = jest.fn().mockReturnValue({
  createkeyResult: jest.fn().mockResolvedValue(keyResultData()),
  findAllkeyResults: jest
    .fn()
    .mockResolvedValue(paginationResultkeyResultData()),
  findOnekeyResult: jest
    .fn()
    .mockImplementation((id) =>
      id === keyResultData().id
        ? Promise.resolve(keyResultData())
        : Promise.reject(new NotFoundException(`KeyResult Not Found`)),
    ),

  updatekeyResult: jest
    .fn()
    .mockImplementation((id) =>
      id === keyResultData().id
        ? Promise.resolve(keyResultData())
        : Promise.reject(new Error(`KeyResult Not Found`)),
    ),

  removekeyResult: jest
    .fn()
    .mockImplementation((id) =>
      id === keyResultData().id
        ? Promise.resolve(keyResultData())
        : Promise.reject(new Error(`KeyResult Not Found`)),
    ),
});
