import { ApiProperty } from '@nestjs/swagger';

export class CartProductResponseDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ example: 'sneaker-nike-air-max' })
  slug: string;

  @ApiProperty({ example: 'Laptop' })
  name: string;

  @ApiProperty({ type: Number, example: 99.99 })
  price: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
  thumbnail: string | null;
}

export class CartResponseItemDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ type: CartProductResponseDto })
  product: CartProductResponseDto;

  @ApiProperty({ type: Number, example: 2 })
  quantity: number;

  @ApiProperty({ type: Number, example: 199.98 })
  subtotal: number;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'color' },
        value: { type: 'string', example: 'Silver' }
      }
    },
    required: false,
    nullable: true,
    example: [{ name: 'color', value: 'Silver' }, { name: 'size', value: '13 inch' }]
  })
  selectedAttributes: { name: string; value: string }[] | null;
}

export class CartResponseDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ type: Number, example: 1 })
  userId: number;

  @ApiProperty({ type: [CartResponseItemDto] })
  items: Array<CartResponseItemDto>;

  @ApiProperty({ type: Number, example: 199.98 })
  total: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
