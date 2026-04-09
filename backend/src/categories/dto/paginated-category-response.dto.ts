import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto';
import { PaginationMetaDto } from 'src/common/dto/paginate.dto';

export class PaginatedCategoryResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  data: CategoryResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
