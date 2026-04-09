import { ApiProperty } from '@nestjs/swagger';
import { AddressResponseDto } from './address-response.dto';
import { PaginationMetaDto } from 'src/common/dto/paginate.dto';

export class PaginatedAddressResponseDto {
  @ApiProperty({ type: [AddressResponseDto] })
  data: AddressResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
