import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWishlistItemDto {
  @ApiProperty({ type: Number, example: 1, description: 'Product ID' })
  @IsInt()
  @IsPositive()
  productId: number;
}
