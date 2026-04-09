export interface Address {
  id: number;
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  specificAddress: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  specificAddress: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  receiverName?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  specificAddress?: string;
  isDefault?: boolean;
}
