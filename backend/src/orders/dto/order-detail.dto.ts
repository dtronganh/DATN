import { ApiProperty } from '@nestjs/swagger';
import { Status } from '../entities/status.entity';
import { OrderItemResponseDto } from './order-item-response.dto';

export class OrderDetailDto {
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

  @ApiProperty({ example: '123 Nguyen Hue St, District 1, Ho Chi Minh City' })
  receiverAddress: string;

  @ApiProperty({ example: 'John Doe' })
  receiverName: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: [OrderItemResponseDto] })
  previews: Array<OrderItemResponseDto>;

  @ApiProperty({ type: Number, example: 2 })
  itemCount: number;
}
