import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { CartItem } from './cart_item.entity';

@Entity('carts')
export class Cart extends BaseEntity {
  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @OneToMany(() => CartItem, (e) => e.cart)
  cartItems: Array<CartItem>;
}
