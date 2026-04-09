import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectedAttributeDto {
  @ApiProperty({ example: 'color', description: 'Attribute name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Silver', description: 'Selected attribute value' })
  @IsString()
  value: string;
}

export class ProductRequestDto {
  @ApiProperty({ type: Number, example: 1, description: 'Product ID' })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({ type: Number, example: 2, description: 'Product quantity' })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    type: [SelectedAttributeDto],
    required: false,
    example: [{ name: 'color', value: 'Silver' }, { name: 'size', value: '13 inch' }],
    description: 'Selected product attributes (if product has variants)'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedAttributeDto)
  selectedAttributes?: SelectedAttributeDto[];
}

export class CreateOrderDto {
  @ApiProperty({ type: [ProductRequestDto], description: 'Array of products' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductRequestDto)
  @IsNotEmpty({ each: true })
  products: Array<ProductRequestDto>;

  @ApiProperty({ type: Number, example: 1, description: 'Address ID' })
  @IsInt()
  @IsPositive()
  addressId: number;

  @ApiProperty({ description: 'Order notes', example: 'Please deliver after 5 PM', required: false, nullable: true })
  @IsString()
  @IsOptional()
  note: string | null;
}
