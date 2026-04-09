import { ApiProperty } from '@nestjs/swagger';
import { Status } from '../entities/status.entity';

export class CreatedItemDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ type: Number, example: 1 })
  productId: number;

  @ApiProperty({ type: Number, example: 2 })
  quantity: number;

  @ApiProperty({ type: Number, example: 99.99 })
  price: number;

  @ApiProperty({ type: Number, example: 199.98 })
  subtotal: number;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'color' },
        value: { type: 'string', example: 'Silver' }
      }
    },
    required: false,
    nullable: true,
    example: [{ name: 'color', value: 'Silver' }, { name: 'size', value: '13 inch' }]
  })
  selectedAttributes: { name: string; value: string }[] | null;
}

export class CreatedOrderDto {
  @ApiProperty({ type: Number, example: 1 })
  id: number;

  @ApiProperty({ enum: Status, example: Status.PENDING })
  status: Status;

  @ApiProperty({ type: Number, example: 199.98 })
  totalAmount: number;

  @ApiProperty({ example: 'Please deliver after 5 PM', nullable: true })
  note: string | null;

  @ApiProperty({ example: '+84901234567' })
  receiverPhone: string;

  @ApiProperty({ example: 'John Doe' })
  receiverName: string;

  @ApiProperty({ example: '123 Nguyen Hue St, District 1, Ho Chi Minh City' })
  receiverAddress: string;

  @ApiProperty({ type: [CreatedItemDto] })
  items: Array<CreatedItemDto>;

  @ApiProperty({ type: Date })
  createdAt: Date;
}
