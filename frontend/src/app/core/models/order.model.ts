export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  subtotal: number;
  selectedAttributes?: Array<{
    name: string;
    value: string;
  }>;
}

export interface OrderPreview {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  thumbnail: string;
  selectedAttributes?: Array<{
    name: string;
    value: string;
  }>;
}

export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  note?: string;
  receiverAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  items?: OrderItem[];
  previews?: OrderPreview[];
  itemCount?: number;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
}

export interface CreateOrderPayload {
  addressId: number;
  note?: string;
  products: {
    productId: number;
    quantity: number;
    selectedAttributes?: Array<{
      name: string;
      value: string;
    }>;
  }[];
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  sort?: string;
}
