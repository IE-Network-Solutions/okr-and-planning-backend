import { EntityMetadata } from 'typeorm';

export async function applySearchFilterUtils(
  queryBuilder: any,
  searchFilterDTO: any,
  anyRepository: any,
) {
  const { columnName, query } = searchFilterDTO;

  if (!columnName || !query) {
    return queryBuilder;
  }

  const metadata: EntityMetadata = anyRepository.metadata;
  const column = metadata.findColumnWithPropertyPath(columnName);

  if (!column) {
    return queryBuilder;
  }

  if (columnName === 'deletedAt') {
    if (query !== 'NULL') {
      queryBuilder = queryBuilder
        .withDeleted()
        .andWhere(`${metadata.tableName}.${columnName} IS NOT NULL`);
    } else {
      queryBuilder = queryBuilder.andWhere(
        `${metadata.tableName}.${columnName} IS NULL`,
      );
    }
  } else {
    if (column.type === 'uuid') {
      queryBuilder = queryBuilder.andWhere(
        `${metadata.tableName}.${columnName} = :query`,
        { query },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        `${metadata.tableName}.${columnName} LIKE :query`,
        { query: `%${query}%` },
      );
    }
  }
  return queryBuilder;
}
