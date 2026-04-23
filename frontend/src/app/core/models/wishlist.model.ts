export interface WishlistItem {
  id: number;
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    thumbnail: string;
  };
}

export interface Wishlist {
  id: number;
  userId: number;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AddToWishlistPayload {
  productId: number;
}
