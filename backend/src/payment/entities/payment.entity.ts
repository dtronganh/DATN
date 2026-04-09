import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { Method } from './method.entity';
import { Status } from './status.entity';
import { Order } from 'src/orders/entities/order.entity';

@Entity('payment')
export class Payment extends BaseEntity {
  @Column({
    name: 'method',
    type: 'simple-enum',
    enum: Method,
    default: Method.COD,
    nullable: false,
    unique: false,
  })
  method: Method;

  @Column({
    name: 'status',
    type: 'simple-enum',
    enum: Status,
    default: Status.PENDING,
    nullable: false,
    unique: false,
  })
  status: Status;

  @Column({
    name: 'amount',
    type: 'decimal',
    nullable: false,
    unique: false,
    default: 0,
  })
  amount: number;

  @Column({
    name: 'transaction_id',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  transactionId: string | null;

  @OneToOne(() => Order, (e) => e.payment)
  order: Order;
}
