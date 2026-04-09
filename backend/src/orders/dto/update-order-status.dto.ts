import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '../entities/status.entity';

export class UpdateOrderStatusRequestDto {
  @ApiProperty({ enum: Status, example: Status.SHIPPED, description: 'Order status' })
  @IsEnum(Status, {
    message: 'Status must be one of: PENDING, PAID, SHIPPED, CANCELLED',
  })
  status: Status;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ enum: Status, example: Status.SHIPPED })
  status: Status;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
