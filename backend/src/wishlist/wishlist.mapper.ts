import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { Wishlist } from './entities/wishlist.entity';

export class WishlistMapper {
  static toDto(wishlist: Wishlist): WishlistResponseDto {
    const items = (wishlist.wishlistItems || []).map((item) => ({
      id: item.id,
      product: {
        id: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        price: item.product.price,
        thumbnail: item.product.thumbnail,
      },
    }));

    return {
      id: wishlist.id,
      userId: wishlist.user.id,
      items,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }
}
