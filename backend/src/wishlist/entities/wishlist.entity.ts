import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { WishlistItem } from './wishlist-item.entity';

@Entity('wishlists')
export class Wishlist extends BaseEntity {
  @OneToOne(() => User, (user) => user.wishlist)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @OneToMany(() => WishlistItem, (e) => e.wishlist)
  wishlistItems: Array<WishlistItem>;
}
