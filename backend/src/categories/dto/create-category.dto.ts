import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Electronics' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Category description', example: 'Electronic devices and accessories', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
