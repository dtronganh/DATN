import { CartItem } from 'src/carts/entities/cart_item.entity';
import { Category } from 'src/categories/entities/category.entity';
import { BaseEntity } from 'src/common/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('products')
export class Product extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: false,
  })
  name: string;

  @Column({
    name: 'slug',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  @Index()
  slug: string;

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    unique: false,
  })
  price: number;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
    unique: false,
  })
  description: string | null;

  @Column({
    name: 'stock',
    type: 'int',
    unsigned: true,
    nullable: false,
    unique: false,
    default: 0,
  })
  stock: number;

  @Column({
    name: 'thumbnail',
    type: 'text',
    nullable: true,
    unique: false,
  })
  thumbnail: string | null;

  @Column({
    name: 'images',
    type: 'simple-array',
    nullable: true,
  })
  images: string[] | null;

  @Column({
    name: 'attributes',
    type: 'simple-json',
    nullable: true,
  })
  attributes: { name: string; values: string[] }[] | null;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => CartItem, (e) => e.product)
  cartItems: Array<CartItem>;
}
