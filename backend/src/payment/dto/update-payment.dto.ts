import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../entities/status.entity';

export class UpdatePaymentDto {
  @ApiProperty({
    description: 'Payment status',
    enum: Status,
    example: Status.SUCCESS,
  })
  @IsEnum(Status)
  status: Status;

  @ApiPropertyOptional({
    description: 'Transaction ID',
    type: 'string',
    example: 'TXN123456',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
