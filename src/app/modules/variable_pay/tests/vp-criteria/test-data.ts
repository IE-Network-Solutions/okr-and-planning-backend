import { Pagination } from 'nestjs-typeorm-paginate';
import { CreateVpCriteriaDto } from '../../dtos/vp-criteria-dto/create-vp-criteria.dto';
import { VpCriteria } from '../../entities/vp-criteria.entity';
import { SourceService } from '../../enums/sourceService.enum';

export const vpCriteriaData = (): VpCriteria => {
  return {
    id: '672ae79c-6499-4ab3-a71a-d8a76fd68821',

    name: 'criteria one',

    description: 'criteria one',

    sourceService: SourceService.OKR,

    sourceEndpoint: 'http://localhost:8009/api/v1/objective/single-user-okr',

    isDeduction: false,

    active: true,

    criteriaTargets: null,
    vpScoringCriterions: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
  };
};

export const createVpCriteriaData = (): CreateVpCriteriaDto => {
  return {
    name: 'criteria one',

    description: 'criteria one',

    sourceService: SourceService.OKR,

    sourceEndpoint: 'http://localhost:8009/api/v1/objective/single-user-okr',

    isDeduction: false,

    active: true,
  };
};

export const paginationResultVpCriteriaData = (): Pagination<VpCriteria> => {
  return {
    items: [vpCriteriaData()],
    meta: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    },
  };
};

export const deleteVpCriteriaData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};
