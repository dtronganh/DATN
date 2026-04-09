import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    type: 'number',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Product name',
    type: 'string',
    example: 'Laptop',
  })
  name: string;

  @ApiProperty({
    description: 'Product slug (URL-friendly identifier)',
    type: 'string',
    example: 'laptop',
  })
  slug: string;

  @ApiProperty({
    description: 'Product price',
    type: 'number',
    example: 999.99,
  })
  price: number;

  @ApiProperty({
    description: 'Product description',
    type: 'string',
    nullable: true,
    example: 'High-performance laptop with latest specs',
  })
  description: string | null;

  @ApiProperty({
    description: 'Product stock quantity',
    type: 'number',
    example: 50,
  })
  stock: number;

  @ApiProperty({
    description: 'Product thumbnail URL',
    type: 'string',
    nullable: true,
    example: 'https://example.com/product.jpg',
  })
  thumbnail: string | null;

  @ApiProperty({
    description: 'Product images URLs',
    type: 'array',
    items: { type: 'string' },
    nullable: true,
    example: ['https://example.com/product1.jpg', 'https://example.com/product2.jpg'],
  })
  images: string[] | null;

  @ApiProperty({
    description: 'Product attributes',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        values: { type: 'array', items: { type: 'string' } },
      },
    },
    nullable: true,
    example: [
      { name: 'color', values: ['red', 'blue'] },
      { name: 'size', values: ['S', 'M'] },
    ],
  })
  attributes: { name: string; values: string[] }[] | null;

  @ApiProperty({
    description: 'Category ID of the product',
    type: 'number',
    example: 2,
  })
  categoryId: number;

  @ApiProperty({
    description: 'Product creation timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-22T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Product last update timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-22T10:30:00Z',
  })
  updatedAt: Date;
}
