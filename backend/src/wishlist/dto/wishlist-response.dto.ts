import { ApiProperty } from '@nestjs/swagger';

export class WishlistProductResponseDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ example: 'Laptop' })
  name: string;

  @ApiProperty({ type: Number, example: 99.99 })
  price: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
  thumbnail: string | null;
}

export class WishlistResponseItemDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ type: WishlistProductResponseDto })
  product: WishlistProductResponseDto;
}

export class WishlistResponseDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ type: Number, example: 1 })
  userId: number;

  @ApiProperty({ type: [WishlistResponseItemDto] })
  items: Array<WishlistResponseItemDto>;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
