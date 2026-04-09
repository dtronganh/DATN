import { BaseEntity } from 'src/common/base.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({
    name: 'name',
    length: 255,
    type: 'varchar',
    unique: false,
    nullable: false,
    default: '',
  })
  name: string;

  @Column({
    name: 'description',
    length: 255,
    type: 'varchar',
    unique: false,
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'slug',
    length: 255,
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  @Index()
  slug: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Array<Product>;
}
