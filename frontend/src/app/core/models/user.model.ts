export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
  password?: string;
  image?: string;
}

export interface UpdateUserPayload {
  role?: 'user' | 'admin';
  isActive?: boolean;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  sort?: string;
}
