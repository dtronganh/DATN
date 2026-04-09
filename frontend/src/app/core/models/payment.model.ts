export type PaymentMethod = 'COD' | 'CARD' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Payment {
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePaymentPayload {
  orderId: number;
  method: PaymentMethod;
  amount: number;
}

export interface UpdatePaymentPayload {
  status: PaymentStatus;
}
