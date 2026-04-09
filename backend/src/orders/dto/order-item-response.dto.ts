import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ type: Number, example: 1 })
  productId: number;

  @ApiProperty({ example: 'Laptop' })
  productName: string;

  @ApiProperty({ type: Number, example: 2 })
  quantity: number;

  @ApiProperty({ type: Number, example: 99.99 })
  price: number;

  @ApiProperty({ type: Number, example: 199.98 })
  subtotal: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
  thumbnail: string | null;

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

  @ApiProperty({ type: Date })
  createdAt: Date;
}
