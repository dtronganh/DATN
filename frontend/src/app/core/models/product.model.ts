export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  description?: string;
  stock: number;
  thumbnail: string;
  images: string[];
  attributes?: null;
  categoryId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  stock: number;
  categoryId: number;
  thumbnail: string;
  images: string[];
  description?: string;
}

export interface UpdateProductPayload {
  name?: string;
  price?: number;
  stock?: number;
  categoryId?: number;
  thumbnail?: string;
  images?: string[];
  description?: string;
}

export interface ProductListParams {
  categoryId?: number;
  sort?: string;
  page?: number;
  limit?: number;
}
