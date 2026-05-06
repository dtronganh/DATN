import { Address } from 'src/address/entities/address.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { Wishlist } from 'src/wishlist/entities/wishlist.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: false,
  })
  password: string;

  @Column({
    name: 'full-name',
    length: 255,
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  fullName: string;

  @Column({ name: 'role', type: 'simple-enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({
    name: 'image',
    type: 'text',
    nullable: true,
    unique: false,
  })
  image: string | null;

  @Column({
    name: 'refresh_token',
    type: 'text',
    nullable: true,
    unique: false,
  })
  refreshToken: string | null;

  @Column({
    name: 'reset_password_token',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  resetPasswordToken: string | null;

  @Column({
    name: 'reset_password_expires',
    type: 'datetime',
    nullable: true,
  })
  resetPasswordExpires: Date | null;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Array<Address>;

  @OneToMany(() => Order, (e) => e.user)
  orders: Array<Order>;

  @OneToOne(() => Cart, (e) => e.user)
  cart: Cart;

  @OneToOne(() => Wishlist, (e) => e.user)
  wishlist: Wishlist;
}
