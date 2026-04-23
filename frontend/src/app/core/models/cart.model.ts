export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    thumbnail: string;
    slug: string;
  };
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  createdAt: string;
}

export interface AddToCartPayload {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
