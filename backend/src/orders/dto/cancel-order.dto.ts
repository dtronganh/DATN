import { IsEnum, IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '../entities/status.entity';

export class CancelOrderDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ enum: Status, example: Status.CANCELLED })
  status: Status;

  @ApiProperty({ type: Date })
  cancelledAt: Date;
}
