import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsPositive, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductAttributeDto } from './product-attribute.dto';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    type: 'string',
    example: 'Laptop',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product price',
    type: 'number',
    example: 999.99,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({
    description: 'Product description',
    type: 'string',
    example: 'High-performance laptop with latest specs',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Product stock quantity',
    type: 'number',
    example: 50,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    description: 'Product thumbnail URL',
    type: 'string',
    example: 'https://example.com/product.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({
    description: 'Product images URLs',
    type: 'array',
    items: { type: 'string' },
    example: ['https://example.com/product1.jpg', 'https://example.com/product2.jpg'],
  })
  @IsOptional()
  images?: string[];

  @ApiProperty({
    description: 'Category ID',
    type: 'number',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiPropertyOptional({
    description: 'Product attributes',
    type: [ProductAttributeDto],
    example: [
      { name: 'color', values: ['red', 'blue'] },
      { name: 'size', values: ['S', 'M'] },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];
}
