import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PaymentMapper } from './payment.mapper';
import { Order } from 'src/orders/entities/order.entity';
import { Payload } from 'src/common/payload';
import { Status } from './entities/status.entity';
import { Status as OrderStatus } from 'src/orders/entities/status.entity';
import { I18nContext } from 'nestjs-i18n';
import { Role } from 'src/users/entities/user.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
  ) { }

  async create(
    i18n: I18nContext,
    payload: Payload,
    createPaymentDto: CreatePaymentDto,
  ) {
    const order = await this.orderRepository.findOne({
      where: { deletedAt: IsNull(), id: createPaymentDto.orderId },
      relations: ['payment', 'user'],
    });
    if (!order) {
      throw new NotFoundException(
        i18n.t('common.payment.errors.order_not_found', {
          args: { id: createPaymentDto.orderId },
        }),
      );
    }
    if (order.payment) {
      throw new BadRequestException(
        i18n.t('common.payment.errors.order_already_has_payment'),
      );
    }
    if (order.user.id !== payload.userId) {
      throw new UnauthorizedException(
        i18n.t('common.payment.errors.user_mismatch'),
      );
    }
    if (createPaymentDto.amount !== order.totalAmount) {
      throw new BadRequestException(
        i18n.t('common.payment.errors.amount_mismatch'),
      );
    }
    const payment = this.paymentRepository.create({
      amount: createPaymentDto.amount,
      method: createPaymentDto.method,
      status: Status.PENDING,
      order,
    });
    const savedPayment = await this.paymentRepository.save(payment);
    order.payment = savedPayment;
    await this.orderRepository.save(order);
    return PaymentMapper.toDto(savedPayment);
  }

  async getPaymentHistory(payload: Payload) {
    const where: FindOptionsWhere<Payment> = {
      order: {
        deletedAt: IsNull(),
        ...(payload.role !== Role.ADMIN ? { user: { id: payload.userId } } : {}),
      },
    };

    const payments = await this.paymentRepository.find({
      where,
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });

    return payments.map((payment) => PaymentMapper.toDto(payment));
  }

  async getPaymentById(i18n: I18nContext, paymentId: number, userId: number) {
    const payment = await this.paymentRepository.findOne({
      where: {
        id: paymentId,
        order: {
          user: { id: userId },
          deletedAt: IsNull(),
        },
      },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(
        i18n.t('common.payment.errors.payment_not_found'),
      );
    }

    return PaymentMapper.toDto(payment);
  }

  async update(
    i18n: I18nContext,
    paymentId: number,
    payload: Payload,
    updatePaymentDto: UpdatePaymentDto,
  ) {
    const where: FindOptionsWhere<Payment> = {
      id: paymentId,
      order: {
        deletedAt: IsNull(),
        ...(payload.role !== Role.ADMIN ? { user: { id: payload.userId } } : {}),
      },
    };

    const payment = await this.paymentRepository.findOne({
      where,
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(
        i18n.t('common.payment.errors.payment_not_found'),
      );
    }

    payment.status = updatePaymentDto.status;
    if (updatePaymentDto.transactionId) {
      payment.transactionId = updatePaymentDto.transactionId;
    }
    const updatedPayment = await this.paymentRepository.save(payment);
    if (updatedPayment.status === Status.SUCCESS && payment.order && payment.order.status === OrderStatus.PENDING) {
      payment.order.status = OrderStatus.PAID;
      await this.orderRepository.save(payment.order);

    }
    return PaymentMapper.toDto(updatedPayment);
  }
}
