import { CartResponseDto } from './dto/cart-response.dto';
import { Cart } from './entities/cart.entity';

export class CartsMapper {
  static toDto(cart: Cart): CartResponseDto {
    const items = (cart.cartItems || []).map((item) => ({
      id: item.id,
      product: {
        id: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        price: item.product.price,
        thumbnail: item.product.thumbnail,
      },
      quantity: item.quantity,
      subtotal: item.quantity * item.product.price,
      selectedAttributes: item.selectedAttributes || null,
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      id: cart.id,
      userId: cart.user.id,
      items,
      total,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
