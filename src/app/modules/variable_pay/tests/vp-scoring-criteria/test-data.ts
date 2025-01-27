import { Pagination } from 'nestjs-typeorm-paginate';
import { UserVpScoring } from '../../entities/user-vp-scoring.entity';
import { UpdateUserVpScoringDto } from '../../dtos/user-vp-scoring-dto/update-user-vp-scoring.dto';
import { CreateUserVpScoringDto } from '../../dtos/user-vp-scoring-dto/create-user-vp-scoring.dto';
import { VpScoringCriterion } from '../../entities/vp-scoring-criterion.entity';
import { CreateVpScoringCriterionDto } from '../../dtos/vp-scoring-criteria-dto/create-vp-scoring-criterion.dto';
import { UpdateVpScoringCriterionDto } from '../../dtos/vp-scoring-criteria-dto/update-vp-scoring-criterion.dto';

export const userVpScoringCriteriaData = (): VpScoringCriterion => {
  return {
    id: '5f9b6d2c-149c-4292-8914-0d1a966f7516',
    vpScoringId: '123e4567-e89b-12d3-a456-426614174027',

    vpCriteriaId: '123e4567-e89b-12d3-a456-426614174028',

    weight: 15,
    tenantId: '123e4567-e89b-12d3-a456-426614174030',
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
    vpCriteria: null,
    vpScoring: null,
  };
};

export const createUserVpScoringCriteriaData =
  (): CreateVpScoringCriterionDto => {
    return {
      vpScoringId: '123e4567-e89b-12d3-a456-426614174027',

      vpCriteriaId: '123e4567-e89b-12d3-a456-426614174028',

      weight: 15,
    };
  };

export const updateUserVpScoringCriteriaData =
  (): UpdateVpScoringCriterionDto => {
    return {
      id: '5f9b6d2c-149c-4292-8914-0d1a966f7516',
      vpScoringId: '123e4567-e89b-12d3-a456-426614174027',

      vpCriteriaId: '123e4567-e89b-12d3-a456-426614174028',

      weight: 15,
    };
  };

export const deleteUserVpScoringCriteriaData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};

export const paginationResultUserVpScoringCriteriaData =
  (): Pagination<VpScoringCriterion> => {
    return {
      items: [userVpScoringCriteriaData()],
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    };
  };
