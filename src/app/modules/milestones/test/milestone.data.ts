import { Pagination } from 'nestjs-typeorm-paginate';
import { Milestone } from '../entities/milestone.entity';
import { Status } from '../enum/milestone.status.enum';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';

export const milestoneData = (): Milestone => {
  return {
    id: '672ae79c-6499-4ab3-a71a-d8a76fd68821',
    keyResultId: '8988e162-940a-4ae8-94f1-bfd598d6e9fc',
    title: 'milestone 1',
    description: 'milestone 1',
    status: Status.COMPLETED,
    weight: 10,
    tenantId: '57577865-7625-4170-a803-a73567e19216',
    keyResult: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
    isClosed: false,
  };
};

export const createMilestoneData = (): CreateMilestoneDto => {
  return {
    keyResultId: '8988e162-940a-4ae8-94f1-bfd598d6e9fc',
    title: 'milestone 1',
    description: 'milestone 1',
    status: Status.COMPLETED,
    weight: 10,
  };
};
export const deleteMilestoneData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};

export const updateMilestoneDataReturned = () => {
  return {
    generatedMaps: [],
    raw: [],
    affected: 1,
  };
};

export const paginationResultMilestoneData = (): Pagination<Milestone> => {
  return {
    items: [milestoneData()],
    meta: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    },
  };
};

export const updateMilestoneData = () => {
  return {
    id: '672ae79c-6499-4ab3-a71a-d8a76fd68821',
    keyResultId: '8988e162-940a-4ae8-94f1-bfd598d6e9fc',
    title: 'milestone 1',
    description: 'milestone 1',
    status: Status.COMPLETED,
    weight: 10,
    tenantId: '57577865-7625-4170-a803-a73567e19216',
    keyResult: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};
export const createMilestoneDataOnCreate = () => {
  return {
    keyResultId: '8988e162-940a-4ae8-94f1-bfd598d6e9fc',
    title: 'milestone 1',
    description: 'milestone 1',
    status: Status.COMPLETED,
    weight: 10,
    tenantId: '57577865-7625-4170-a803-a73567e19216',
    keyResult: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};

export const updateMilestoneDataOnUpdate = () => {
  return {
    id: '672ae79c-6499-4ab3-a71a-d8a76fd68821',
    keyResultId: '8988e162-940a-4ae8-94f1-bfd598d6e9fc',
    title: 'milestone 1',
    description: 'milestone 1',
    status: Status.COMPLETED,
    weight: 10,
    tenantId: '57577865-7625-4170-a803-a73567e19216',
    keyResult: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};

export const findOneNotFoundReturnValue = () => {
  return {
    statusCode: 404,
    message: 'MilestoneMilestone with Id 4567 not found',
    error: 'Not Found',
  };
};
