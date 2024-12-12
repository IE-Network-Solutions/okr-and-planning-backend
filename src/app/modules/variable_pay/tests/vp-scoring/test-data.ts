import { Pagination } from 'nestjs-typeorm-paginate';
import { CreateVpScoringDto } from '../../dtos/vp-scoring-dto/create-vp-scoring.dto';
import { UpdateVpScoringDto } from '../../dtos/vp-scoring-dto/update-vp-scoring.dto';
import { VpScoring } from '../../entities/vp-scoring.entity';

export const VpScoringData = (): VpScoring => {
  return {
    id: '672ae79c-6499-4ab3-a71a-d8a76fd68821',
    name: 'Scoring Name',
    totalPercentage: 85,
    tenantId: '57577865-7625-4170-a803-a73567e19216',
    vpScoringCriterions: null,
    vpScoreInstance: null,
    userVpScoring: null,
    updatedAt: new Date('2022-10-22 07:11:42'),
    createdAt: new Date('2022-10-22 07:11:42'),
  };
};

export const createVpScoringData = (): CreateVpScoringDto => {
  return {
    name: 'string',

    totalPercentage: 10,
    vpScoringCriteria: [
      {
        id: 'f4e9b94e-77ea-423c-b43c-ef75c8219b63', // Optional field
        vpScoringId: '2c5c1b7d-7a5f-4989-9c82-2b5d7e61b6a2', // Optional field
        vpCriteriaId: 'c3e8f40d-aeec-4b27-8e2c-356d5d763af2', // Required field
        weight: 10.5, // Valid decimal value
      },
      {
        vpCriteriaId: 'ef2e598a-3e44-429e-9850-72c0e623ba9f', // Required field
        weight: 25.0, // Valid decimal value
      },
      {
        id: 'c5c1234f-5678-4321-b321-5dca23ed4f12', // Optional field
        vpCriteriaId: 'fcbf10c6-8dc2-411c-8efc-2df0a849e95f', // Required field
        weight: 0.75, // Valid decimal value
      },
    ],
    createUserVpScoringDto: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        vpScoringId: '123e4567-e89b-12d3-a456-426614174001',
      },
    ],
  };
};

export const updateVpScoringData = (): UpdateVpScoringDto => {
  return {
    name: 'string',

    totalPercentage: 10,
    vpScoringCriteria: [
      {
        id: 'f4e9b94e-77ea-423c-b43c-ef75c8219b63', // Optional field
        vpScoringId: '2c5c1b7d-7a5f-4989-9c82-2b5d7e61b6a2', // Optional field
        vpCriteriaId: 'c3e8f40d-aeec-4b27-8e2c-356d5d763af2', // Required field
        weight: 10.5, // Valid decimal value
      },
      {
        vpCriteriaId: 'ef2e598a-3e44-429e-9850-72c0e623ba9f', // Required field
        weight: 25.0, // Valid decimal value
      },
      {
        id: 'c5c1234f-5678-4321-b321-5dca23ed4f12', // Optional field
        vpCriteriaId: 'fcbf10c6-8dc2-411c-8efc-2df0a849e95f', // Required field
        weight: 0.75, // Valid decimal value
      },
    ],
    createUserVpScoringDto: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        vpScoringId: '123e4567-e89b-12d3-a456-426614174001',
      },
    ],
  };
};
export const paginationResultVpScoringData = (): Pagination<VpScoring> => {
  return {
    items: [VpScoringData()],
    meta: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    },
  };
};

export const deleteVpScoringData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};
