import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order_item.entity';
import { CreatedOrderDto, CreatedItemDto } from './dto/created-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';
import { Product } from 'src/products/entities/product.entity';

export class OrdersMapper {
  static toCustomDto(order: Order, items: OrderItem[]): CreatedOrderDto {
    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      note: order.note,
      receiverAddress: order.receiverAddress,
      receiverName: order.receiverName,
      receiverPhone: order.receiverPhone,
      items: items.map((item) => this.toItemDto(item)),
      createdAt: order.createdAt,
    };
  }

  private static toItemDto(item: OrderItem): CreatedItemDto {
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      subtotal: Number(item.price) * item.quantity,
      selectedAttributes: item.selectedAttributes || null,
    };
  }

  static toDto(entity: Order): OrderResponseDto {
    return {
      id: entity.id,
      status: entity.status,
      totalAmount: entity.totalAmount,
      itemCount: entity.orderItems.length,
      createdAt: entity.createdAt,
    };
  }

  static toOrderItemResponseDto(
    item: OrderItem,
    product: Product | undefined,
  ): OrderItemResponseDto {
    return {
      id: item.id,
      productId: item.productId,
      productName: product?.name || '',
      quantity: item.quantity,
      price: item.price,
      subtotal: Number(item.price) * item.quantity,
      thumbnail: product?.thumbnail || null,
      selectedAttributes: item.selectedAttributes || null,
      createdAt: item.createdAt,
    };
  }
}
