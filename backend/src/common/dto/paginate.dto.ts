import { ApiProperty } from '@nestjs/swagger';

export interface PaginationRequest {
  page: number;
  limit: number;
  sort?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export class PaginationMetaDto {
  @ApiProperty({ type: Number, example: 1 })
  page: number;

  @ApiProperty({ type: Number, example: 20 })
  limit: number;

  @ApiProperty({ type: Number, example: 100 })
  total: number;

  @ApiProperty({ type: Number, example: 5 })
  totalPages: number;
}
