import { ApiProperty } from '@nestjs/swagger';
import { Method } from '../entities/method.entity';
import { Status } from '../entities/status.entity';

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    type: 'number',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Payment method',
    enum: Method,
    example: Method.COD,
  })
  method: Method;

  @ApiProperty({
    description: 'Payment status',
    enum: Status,
    example: Status.PENDING,
  })
  status: Status;

  @ApiProperty({
    description: 'Payment amount',
    type: 'number',
    example: 99.99,
  })
  amount: number;

  @ApiProperty({
    description: 'Transaction ID',
    type: 'string',
    nullable: true,
    example: 'TXN123456',
  })
  transactionId: string | null;

  @ApiProperty({
    description: 'Payment creation timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-22T10:30:00Z',
  })
  createdAt: Date;
}
