import { Objective } from '../entities/Objective.entity';
import { CreateObjectiveDto } from '../dto/create-Objective.dto';
import { Pagination } from 'nestjs-typeorm-paginate';

export const objectiveData = (): Objective => {
  return {
    id: '672ae79c-6499-4ab3-a71a-d8a76fd68821',
    title: 'obj 1',
    description: 'obj 1',
    userId: 'f823f84b-ad37-445e-ae01-9920ce5c916a',
    deadline: new Date('2022-10-22 07:11:42'),
    allignedKeyResultId: '13f734dc-56c6-4118-87fc-e403a00693c0',
    tenantId: '57577865-7625-4170-a803-a73567e19216',
    keyResults: null,
    allignedKeyResult: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};

export const createobjectiveData = (): CreateObjectiveDto => {
  return {
    title: 'obj 1',
    description: 'obj 1',
    userId: 'f823f84b-ad37-445e-ae01-9920ce5c916a',
    deadline: new Date('2022-10-22 07:11:42'),
    allignedKeyResultId: '13f734dc-56c6-4118-87fc-e403a00693c0',
    keyResult: [],
  };
};
export const delete0bjectiveData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};

export const Update0bjectiveDataReturned = () => {
  return {
    generatedMaps: [],
    raw: [],
    affected: 1,
  };
};

export const paginationResultObjectiveData = (): Pagination<Objective> => {
  return {
    items: [objectiveData()],
    meta: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    },
  };
};

export const updateObjectiveData = () => {
  return {
    id: '672ae79c-6499-4ab3-a71a-d8a76fd68821',
    title: 'obj 1',
    description: 'obj 1',
    userId: 'f823f84b-ad37-445e-ae01-9920ce5c916a',
    deadline: new Date('2022-10-22 07:11:42'),
    allignedKeyResultId: '13f734dc-56c6-4118-87fc-e403a00693c0',
    tenantId: '57577865-7625-4170-a803-a73567e19216',
    keyResults: null,
    allignedKeyResult: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};
export const createobjectiveDataOnCreate = () => {
  return {
    title: 'obj 1',
    description: 'obj 1',
    userId: 'f823f84b-ad37-445e-ae01-9920ce5c916a',
    deadline: new Date('2022-10-22 07:11:42'),
    allignedKeyResultId: '13f734dc-56c6-4118-87fc-e403a00693c0',
    tenantId: '57577865-7625-4170-a803-a73567e19216',
    keyResults: null,
    allignedKeyResult: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};

export const updateObjectiveDataOnUpdate = () => {
  return {
    id: '672ae79c-6499-4ab3-a71a-d8a76fd68821',
    title: 'obj 1',
    description: 'obj 1',
    userId: 'f823f84b-ad37-445e-ae01-9920ce5c916a',
    deadline: new Date('2022-10-22 07:11:42'),
    allignedKeyResultId: '13f734dc-56c6-4118-87fc-e403a00693c0',
    tenantId: '57577865-7625-4170-a803-a73567e19216',
    keyResults: null,
    allignedKeyResult: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedBy: 'selam',
    createdBy: 'selam',
  };
};

export const findOneNotFoundReturnValue = () => {
  return {
    statusCode: 404,
    message: 'Objective with Id 4567 not found',
    error: 'Not Found',
  };
};
