import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateVnpayUrlDto } from './dto/create-vnpay-url.dto';
import { VnpayUrlResponseDto } from './dto/vnpay-url-response.dto';
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
import { Method } from './entities/method.entity';
import { AppConfigService } from 'src/config/config.service';

interface VnpayReturnResult {
  isSuccess: boolean;
  isVerified: boolean;
  message: string;
  paymentId?: number;
  orderId?: number;
  amount?: number;
  method?: Method;
  transactionId?: string;
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private readonly configService: AppConfigService,
  ) { }

  private toVnpDate(date: Date): string {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const gmt7 = new Date(utc + 7 * 60 * 60000);
    const year = gmt7.getFullYear();
    const month = String(gmt7.getMonth() + 1).padStart(2, '0');
    const day = String(gmt7.getDate()).padStart(2, '0');
    const hour = String(gmt7.getHours()).padStart(2, '0');
    const minute = String(gmt7.getMinutes()).padStart(2, '0');
    const second = String(gmt7.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  private normalizeIp(ipAddress: string): string {
    if (!ipAddress) return '127.0.0.1';
    if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') return '127.0.0.1';
    return ipAddress;
  }

  private buildVnpSignData(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params)
      .filter((key) => {
        const value = params[key];
        return value !== undefined && value !== null && String(value).length > 0;
      })
      .sort();

    return sortedKeys
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`)
      .join('&');
  }

  private verifyVnpayChecksum(query: Record<string, string | undefined>): boolean {
    const secureHash = query.vnp_SecureHash;
    if (!secureHash) return false;

    const signingData: Record<string, string> = {};
    Object.entries(query).forEach(([key, value]) => {
      if (!value) return;
      if (key === 'vnp_SecureHash' || key === 'vnp_SecureHashType') return;
      signingData[key] = value;
    });

    const signData = this.buildVnpSignData(signingData);
    const expectedHash = createHmac('sha512', this.configService.vnpaySecureSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    return expectedHash.toLowerCase() === secureHash.toLowerCase();
  }

  async createVnpayUrl(
    i18n: I18nContext,
    payload: Payload,
    createVnpayUrlDto: CreateVnpayUrlDto,
    ipAddress: string,
  ): Promise<VnpayUrlResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: {
        id: createVnpayUrlDto.paymentId,
        order: {
          id: createVnpayUrlDto.orderId,
          user: { id: payload.userId },
          deletedAt: IsNull(),
        },
      },
      relations: ['order', 'order.user'],
    });

    if (!payment) {
      throw new NotFoundException(i18n.t('common.payment.errors.payment_not_found'));
    }

    if (payment.method !== Method.VNPAY) {
      throw new BadRequestException(i18n.t('common.payment.errors.invalid_vnpay_method'));
    }

    if (Math.abs(Number(createVnpayUrlDto.amount) - Number(payment.amount)) > 0.5) {
      throw new BadRequestException(i18n.t('common.payment.errors.amount_mismatch'));
    }

    const txnRef = `PAY_${payment.id}_${Date.now()}`;
    payment.transactionId = txnRef;
    payment.status = Status.PENDING;
    await this.paymentRepository.save(payment);

    const now = new Date();
    const expiredAt = new Date(now.getTime() + 15 * 60 * 1000);
    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.configService.vnpayTmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${payment.order.id}`,
      vnp_OrderType: '100000',
      vnp_Amount: String(Math.round(Number(payment.amount) * 100)),
      vnp_ReturnUrl: this.configService.vnpayReturnUrl,
      vnp_IpAddr: this.normalizeIp(ipAddress),
      vnp_CreateDate: this.toVnpDate(now),
      vnp_ExpireDate: this.toVnpDate(expiredAt),
    };

    if (createVnpayUrlDto.bankCode) {
      params.vnp_BankCode = createVnpayUrlDto.bankCode;
    }

    const signData = this.buildVnpSignData(params);
    const secureHash = createHmac('sha512', this.configService.vnpaySecureSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');
    const paymentUrl = `${this.configService.vnpayUrl}?${signData}&vnp_SecureHash=${secureHash}`;

    return {
      paymentId: payment.id,
      orderId: payment.order.id,
      txnRef,
      paymentUrl,
    };
  }

  async handleVnpayReturn(
    i18n: I18nContext,
    rawQuery: Record<string, string | string[] | undefined>,
  ): Promise<VnpayReturnResult> {
    const query = Object.entries(rawQuery).reduce(
      (acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value[0] : value;
        return acc;
      },
      {} as Record<string, string | undefined>,
    );

    const txRef = query.vnp_TxnRef;
    let payment = txRef
      ? await this.paymentRepository.findOne({
        where: { transactionId: txRef, order: { deletedAt: IsNull() } },
        relations: ['order'],
      })
      : null;

    if (!payment && query.vnp_TransactionNo) {
      payment = await this.paymentRepository.findOne({
        where: { transactionId: query.vnp_TransactionNo, order: { deletedAt: IsNull() } },
        relations: ['order'],
      });
    }

    const isVerified = this.verifyVnpayChecksum(query);
    const responseCodeOk = query.vnp_ResponseCode === '00';
    const transactionStatusOk = query.vnp_TransactionStatus === '00';
    const isSuccess = isVerified && responseCodeOk && transactionStatusOk && !!payment;

    if (payment) {
      if (isSuccess) {
        payment.status = Status.SUCCESS;
        payment.transactionId = query.vnp_TransactionNo || txRef || payment.transactionId;
        await this.paymentRepository.save(payment);

        if (payment.order && payment.order.status !== OrderStatus.PAID) {
          payment.order.status = OrderStatus.PAID;
          await this.orderRepository.save(payment.order);
        }
      } else if (payment.status !== Status.SUCCESS) {
        payment.status = Status.FAILED;
        await this.paymentRepository.save(payment);

        if (
          payment.order &&
          payment.order.status !== OrderStatus.SHIPPED &&
          payment.order.status !== OrderStatus.CANCELLED
        ) {
          payment.order.status = OrderStatus.FAILED;
          await this.orderRepository.save(payment.order);
        }
      }
    }

    return {
      isSuccess,
      isVerified,
      message: isSuccess
        ? i18n.t('common.response.success')
        : i18n.t('common.payment.errors.vnpay_verification_failed'),
      paymentId: payment?.id,
      orderId: payment?.order?.id,
      amount: payment ? Number(payment.amount) : undefined,
      method: payment?.method,
      transactionId: query.vnp_TransactionNo || txRef,
    };
  }

  async handleVnpayIpn(
    i18n: I18nContext,
    rawQuery: Record<string, string | string[] | undefined>,
  ): Promise<{ RspCode: string; Message: string }> {
    const result = await this.handleVnpayReturn(i18n, rawQuery);
    return result.isSuccess
      ? { RspCode: '00', Message: 'Confirm Success' }
      : { RspCode: '97', Message: 'Invalid Signature or Failed Payment' };
  }

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
