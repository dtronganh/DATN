import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({
    name: 'product_id',
    type: 'int',
    nullable: false,
    unsigned: true,
  })
  productId: number;

  @Column({
    name: 'quantity',
    type: 'int',
    default: 0,
    nullable: false,
    unique: false,
    unsigned: true,
  })
  quantity: number;

  @Column({
    name: 'price',
    type: 'decimal',
    default: 0,
    nullable: false,
    unique: false,
    unsigned: true,
  })
  price: number;

  @Column({
    name: 'selected_attributes',
    type: 'simple-json',
    nullable: true,
  })
  selectedAttributes: { name: string; value: string }[] | null;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
