import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn({
    name: 'id',
    unsigned: true,
    type: 'int',
  })
  id: number;

  @Column({
    name: 'quantity',
    type: 'int',
    unsigned: true,
    unique: false,
    nullable: false,
    default: 0,
  })
  quantity: number;

  @Column({
    name: 'selected_attributes',
    type: 'simple-json',
    nullable: true,
  })
  selectedAttributes: { name: string; value: string }[] | null;

  @ManyToOne(() => Cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
