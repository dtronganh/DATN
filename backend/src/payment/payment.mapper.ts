import { PaymentResponseDto } from './dto/payment-response.dto';
import { Payment } from './entities/payment.entity';

export class PaymentMapper {
  static toDto(entity: Payment): PaymentResponseDto {
    return {
      id: entity.id,
      method: entity.method,
      status: entity.status,
      amount: entity.amount,
      transactionId: entity.transactionId,
      createdAt: entity.createdAt,
    };
  }
}
