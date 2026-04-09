import { BaseEntity } from 'src/common/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { OrderItem } from './order_item.entity';
import { User } from 'src/users/entities/user.entity';
import { Status } from './status.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({
    name: 'total_amount',
    type: 'decimal',
    nullable: false,
    unique: false,
    default: 0,
  })
  totalAmount: number;

  @Column({
    name: 'status',
    type: 'simple-enum',
    enum: Status,
    default: Status.PENDING,
  })
  status: Status;

  @Column({
    name: 'note',
    type: 'text',
    nullable: true,
    unique: false,
  })
  note: string | null;

  @Column({
    name: 'receiver_name',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: false,
    default: '',
  })
  receiverName: string;

  @Column({
    name: 'receiver_phone',
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: false,
  })
  receiverPhone: string;

  @Column({
    name: 'receiver_address',
    type: 'text',
    nullable: false,
    unique: false,
  })
  receiverAddress: string;

  @OneToMany(() => OrderItem, (e) => e.order)
  orderItems: Array<OrderItem>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @OneToOne(() => Payment, (e) => e.order)
  @JoinColumn()
  payment: Payment;
}
