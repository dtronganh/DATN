import {
  FindManyOptions,
  FindOptionsOrder,
  ObjectLiteral,
  Repository,
} from 'typeorm';

type SortOrder = 'ASC' | 'DESC';

type PaginateParams<T extends ObjectLiteral, U extends ObjectLiteral> = {
  repository: Repository<T>;
  options: FindManyOptions<T>;
  pagination: PaginationRequest;
  mapper: (item: T) => U;
};

import { PaginatedResponse, PaginationRequest } from './dto/paginate.dto';
export class BaseService {
  async paginate<T extends ObjectLiteral, U extends ObjectLiteral>({
    repository,
    options,
    pagination,
    mapper,
  }: PaginateParams<T, U>): Promise<PaginatedResponse<U>> {
    const { page, limit, sort } = pagination;
    const [rawField, rawOrder] = sort?.split(':') ?? ['createdAt', 'DESC'];
    const sortField = rawField as keyof T;
    const sortOrder = (rawOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as
      | 'ASC'
      | 'DESC';
    const [data, total] = await repository.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
      order: this.buildOrder(sortField, sortOrder),
    });
    return {
      data: data.map(mapper),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  protected buildOrder<T>(
    field: keyof T,
    order: SortOrder,
  ): FindOptionsOrder<T> {
    return {
      [field]: order,
    } as FindOptionsOrder<T>;
  }
}
