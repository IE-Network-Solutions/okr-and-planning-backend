import { EntityMetadata, SelectQueryBuilder } from 'typeorm';

interface FilterOptions {
  [key: string]: any;
}

export default async function filterEntities<T>(
  queryBuilder: SelectQueryBuilder<T>,
  filters: FilterOptions,
  anyRepository: any,
  filterableFields: string[],
): Promise<SelectQueryBuilder<T>> {
  const metadata: EntityMetadata = anyRepository.metadata;
  const tableAlias = queryBuilder.alias || metadata.tableName;
  for (const [key, value] of Object.entries(filters)) {
    if (key !== 'searchString') {
      const [relation, field] = key.split('.');

      if (value !== undefined) {
        if (relation && field) {
          if (value === 'notNull') {
            queryBuilder.andWhere(`${relation}.${field} IS NOT NULL`);
          } else if (value === null) {
            queryBuilder.andWhere(`${relation}.${field} IS NULL`);
          } else {
            queryBuilder.andWhere(`${relation}.${field} = :${field}`, {
              [field]: value,
            });
          }
        } else {
          if (value === 'notNull') {
            queryBuilder.andWhere(`${tableAlias}.${key} IS NOT NULL`);
          } else if (value === null) {
            queryBuilder.andWhere(`${tableAlias}.${key} IS NULL`);
          } else {
            queryBuilder.andWhere(`${tableAlias}.${key} = :${key}`, {
              [key]: value,
            });
          }
        }
      }
    }
  }
  const searchString = filters.searchString?.toLowerCase();
  if (searchString && filterableFields.length > 0) {
    const searchConditions = filterableFields
      .map((field) => {
        return `LOWER(${tableAlias}.${field}) LIKE :searchString`;
      })
      .join(' OR ');

    queryBuilder.andWhere(`(${searchConditions})`, {
      searchString: `%${searchString}%`,
    });
  }
  return queryBuilder;
}
