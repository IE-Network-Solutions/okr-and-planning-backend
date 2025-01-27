import { Pagination } from 'nestjs-typeorm-paginate';
import { UserVpScoring } from '../../entities/user-vp-scoring.entity';
import { UpdateUserVpScoringDto } from '../../dtos/user-vp-scoring-dto/update-user-vp-scoring.dto';
import { CreateUserVpScoringDto } from '../../dtos/user-vp-scoring-dto/create-user-vp-scoring.dto';
import { VpScoreInstance } from '../../entities/vp-score-instance.entity';
import { CreateVpScoreInstanceDto } from '../../dtos/vp-score-instance-dto/create-vp-score-instance.dto';
import { UpdateVpScoreInstanceDto } from '../../dtos/vp-score-instance-dto/update-vp-score-instance.dto';

export const userVpScoringInstanceData = (): VpScoreInstance => {
  return {
    id: '5f9b6d2c-149c-4292-8914-0d1a966f7516',
    userId: '123e4567-e89b-12d3-a456-426614174026',
    vpScoringId: '123e4567-e89b-12d3-a456-426614174027',
    vpScore: 88.5,
    breakdown: [
      {
        criteriaId: '123e4567-e89b-12d3-a456-426614174028',
        score: 40.0,
        targetId: '212a2f80-e86b-41dc-a860-bf95606623e6',
        weight: 15,
      },
    ],
    monthId: '123e4567-e89b-12d3-a456-426614174029',
    tenantId: '123e4567-e89b-12d3-a456-426614174030',
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    vpScoring: null,
  };
};

export const createUserVpScoringInstanceData = (): CreateVpScoreInstanceDto => {
  return {
    userId: '123e4567-e89b-12d3-a456-426614174026',
    vpScoringId: '123e4567-e89b-12d3-a456-426614174027',
    vpScore: 88.5,
    breakdown: [
      {
        criteriaId: '123e4567-e89b-12d3-a456-426614174028',
        score: 40.0,
        targetId: '212a2f80-e86b-41dc-a860-bf95606623e6',
        weight: 15,
      },
    ],
    monthId: '123e4567-e89b-12d3-a456-426614174029',
  };
};

export const updateUserVpScoringInstanceData = (): UpdateVpScoreInstanceDto => {
  return {
    userId: '123e4567-e89b-12d3-a456-426614174026',
    vpScoringId: '123e4567-e89b-12d3-a456-426614174027',
    vpScore: 88.5,
    breakdown: [
      {
        criteriaId: '123e4567-e89b-12d3-a456-426614174028',
        score: 40.0,
        targetId: '212a2f80-e86b-41dc-a860-bf95606623e6',
        weight: 15,
      },
    ],
    monthId: '123e4567-e89b-12d3-a456-426614174029',
  };
};

export const deleteUserVpScoringInstanceData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};

export const paginationResultUserVpScoringInstanceData =
  (): Pagination<VpScoreInstance> => {
    return {
      items: [userVpScoringInstanceData()],
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    };
  };
