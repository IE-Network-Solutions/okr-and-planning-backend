import { NotFoundException } from '@nestjs/common';
import {
  milestoneData,
  paginationResultMilestoneData,
} from '../test/milestone.data';

export const MilestonesService = jest.fn().mockReturnValue({
  createMilestone: jest.fn().mockResolvedValue(milestoneData()),
  findAllMilestones: jest
    .fn()
    .mockResolvedValue(paginationResultMilestoneData()),
  findOneMilestone: jest
    .fn()
    .mockImplementation((id) =>
      id === milestoneData().id
        ? Promise.resolve(milestoneData())
        : Promise.reject(new NotFoundException(`Milestone Not Found`)),
    ),

  updateMilestone: jest
    .fn()
    .mockImplementation((id) =>
      id === milestoneData().id
        ? Promise.resolve(milestoneData())
        : Promise.reject(new Error(`Milestone Not Found`)),
    ),

  removeMilestone: jest
    .fn()
    .mockImplementation((id) =>
      id === milestoneData().id
        ? Promise.resolve(milestoneData())
        : Promise.reject(new Error(`Milestone Not Found`)),
    ),
});
