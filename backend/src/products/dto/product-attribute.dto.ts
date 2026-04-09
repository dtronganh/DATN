import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class ProductAttributeDto {
  @ApiProperty({
    description: 'Attribute name',
    type: 'string',
    example: 'color',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Attribute values',
    type: 'array',
    items: { type: 'string' },
    example: ['red', 'blue', 'black'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  values: string[];
}
