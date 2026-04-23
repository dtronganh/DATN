import { ApiProperty } from '@nestjs/swagger';

export class VnpayUrlResponseDto {
  @ApiProperty({ type: 'number', example: 1 })
  paymentId: number;

  @ApiProperty({ type: 'number', example: 1 })
  orderId: number;

  @ApiProperty({ type: 'string', example: 'PAY_1_1710000000000' })
  txnRef: string;

  @ApiProperty({
    type: 'string',
    example:
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Version=2.1.0&vnp_Command=pay',
  })
  paymentUrl: string;
}
