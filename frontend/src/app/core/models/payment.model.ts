export type PaymentMethod = 'COD' | 'VNPAY';
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

export interface CreateVnpayUrlPayload {
  paymentId: number;
  orderId: number;
  amount: number;
  bankCode?: string;
}

export interface VnpayUrlResponse {
  paymentId: number;
  orderId: number;
  txnRef: string;
  paymentUrl: string;
}
