import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ type: Number, example: 3, description: 'New quantity' })
  @IsInt()
  @Min(0)
  quantity: number;
}
