import { PaginationDto } from '../commonDto/pagination-dto';

export const paginationOptions = (): PaginationDto => {
  return {
    page: 1,
    limit: 2,
    orderBy: 'createdAt',
    orderDirection: 'ASC',
  };
};
