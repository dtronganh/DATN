import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateVnpayUrlDto {
  @ApiProperty({
    description: 'Payment ID',
    type: 'number',
    example: 1,
  })
  @IsNumber()
  paymentId: number;

  @ApiProperty({
    description: 'Order ID',
    type: 'number',
    example: 1,
  })
  @IsNumber()
  orderId: number;

  @ApiProperty({
    description: 'Payment amount',
    type: 'number',
    example: 120000,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Optional VNPay bank code',
    type: 'string',
    example: 'NCB',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  bankCode?: string;
}
