import { NotFoundException } from '@nestjs/common';
import {
  objectiveData,
  paginationResultObjectiveData,
} from '../test/objective.data';

export const ObjectiveService = jest.fn().mockReturnValue({
  createObjective: jest.fn().mockResolvedValue(objectiveData()),
  findAllObjectives: jest
    .fn()
    .mockResolvedValue(paginationResultObjectiveData()),
  findOneObjective: jest
    .fn()
    .mockImplementation((id) =>
      id === objectiveData().id
        ? Promise.resolve(objectiveData())
        : Promise.reject(new NotFoundException(`Objective Not Found`)),
    ),

  updateObjective: jest
    .fn()
    .mockImplementation((id) =>
      id === objectiveData().id
        ? Promise.resolve(objectiveData())
        : Promise.reject(new Error(`Objective Not Found`)),
    ),

  removeObjective: jest
    .fn()
    .mockImplementation((id) =>
      id === objectiveData().id
        ? Promise.resolve(objectiveData())
        : Promise.reject(new Error(`Objective Not Found`)),
    ),
});
