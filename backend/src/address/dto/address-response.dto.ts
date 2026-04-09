import { ApiProperty } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  receiverName: string;

  @ApiProperty({ example: '+84901234567' })
  phone: string;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  province: string;

  @ApiProperty({ example: 'District 1' })
  district: string;

  @ApiProperty({ example: 'Ben Nghe Ward' })
  ward: string;

  @ApiProperty({ example: '123 Nguyen Hue St' })
  specificAddress: string;

  @ApiProperty({ example: false })
  isDefault: boolean;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
