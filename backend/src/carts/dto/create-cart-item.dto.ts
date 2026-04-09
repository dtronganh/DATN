import { IsInt, IsPositive, Min, IsOptional, IsArray, ValidateNested, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SelectedAttributeDto {
  @ApiProperty({ example: 'color', description: 'Attribute name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Silver', description: 'Selected attribute value' })
  @IsString()
  value: string;
}

export class CreateCartItemDto {
  @ApiProperty({ type: Number, example: 1, description: 'Product ID' })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({ type: Number, example: 2, description: 'Quantity to add' })
  @IsInt()
  @IsPositive()
  @Min(0)
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
