import { ApiProperty } from '@nestjs/swagger';
import { Status } from '../entities/status.entity';

export class OrderResponseDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ enum: Status, example: Status.PENDING })
  status: Status;

  @ApiProperty({ type: Number, example: 199.98 })
  totalAmount: number;

  @ApiProperty({ type: Number, example: 2 })
  itemCount: number;

  @ApiProperty({ type: Date })
  createdAt: Date;
}
