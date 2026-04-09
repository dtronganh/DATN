import {
  IsDecimal,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Method } from '../entities/method.entity';
import { Status } from '../entities/status.entity';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Order ID',
    type: 'number',
    example: 1,
  })
  @IsNumber()
  orderId: number;

  @ApiProperty({
    description: 'Payment method',
    enum: Method,
    example: Method.COD,
  })
  @IsEnum(Method, {
    message: 'method must be a valid Method',
  })
  method: Method;

  @ApiProperty({
    description: 'Payment amount',
    type: 'number',
    example: 99.99,
  })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    description: 'Transaction ID',
    type: 'string',
    nullable: true,
    example: 'TXN123456',
  })
  @IsOptional()
  @IsString()
  transactionId: string | null;
}
