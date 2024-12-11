import { Pagination } from 'nestjs-typeorm-paginate';
import { UserVpScoring } from '../../entities/user-vp-scoring.entity';
import { UpdateUserVpScoringDto } from '../../dtos/user-vp-scoring-dto/update-user-vp-scoring.dto';
import { CreateUserVpScoringDto } from '../../dtos/user-vp-scoring-dto/create-user-vp-scoring.dto';

export const UserVpScoringData = (): UserVpScoring => {
  return {
    id: 'f4e9b94e-77ea-423c-b43c-ef75c8219b63',
    userId: '123e4567-e89b-12d3-a456-426614174000',
    vpScoringId: '123e4567-e89b-12d3-a456-426614174001',
    tenantId: '123e4567-e89b-12d3-a456-426614174002',
    vpScoring: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
  };
};

export const createUserVpScoringData = (): CreateUserVpScoringDto => {
  return {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    vpScoringId: '123e4567-e89b-12d3-a456-426614174001',
  };
};

export const updateUserVpScoringData = (): UpdateUserVpScoringDto => {
  return {
    id: 'f4e9b94e-77ea-423c-b43c-ef75c8219b63',
    userId: '123e4567-e89b-12d3-a456-426614174000',
    vpScoringId: '123e4567-e89b-12d3-a456-426614174001',
  };
};

export const deleteUserVpScoringData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};

export const paginationResultUserVpScoringData =
  (): Pagination<UserVpScoring> => {
    return {
      items: [UserVpScoringData()],
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    };
  };
