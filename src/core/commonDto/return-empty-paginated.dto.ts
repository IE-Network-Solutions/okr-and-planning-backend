import { PaginationDto } from './pagination-dto';

export class EmptyPaginationDto {
  static createEmptyPaginationResult(paginationOptions: PaginationDto) {
    const limit = parseInt(paginationOptions.limit as any, 10);
    const page = parseInt(paginationOptions.page as any);
    return {
      items: [],
      meta: {
        total: 0,
        itemCount: 0,
        perPage: limit || 10,
        itemsPerPage: limit || 10,
        totalPages: 0,
        currentPage: page || 1,
      },
    };
  }
}
