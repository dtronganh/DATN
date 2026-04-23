import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateVnpayUrlDto } from './dto/create-vnpay-url.dto';
import { VnpayUrlResponseDto } from './dto/vnpay-url-response.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Payload } from 'src/common/payload';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuards } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/entities/user.entity';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { AppConfigService } from 'src/config/config.service';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: AppConfigService,
  ) {}

  private extractClientIp(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
      return forwardedFor.split(',')[0]?.trim() || '127.0.0.1';
    }

    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.length > 0) {
      return realIp;
    }

    return req.socket.remoteAddress || req.ip || '127.0.0.1';
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get payment history' })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
    type: [PaymentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPaymentHistory(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
  ): Promise<Array<PaymentResponseDto>> {
    return this.paymentService.getPaymentHistory(payload);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Payment ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentById(
    @I18n() i18n: I18nContext,
    @Param('id', ParseIntPipe) id: number,
    @GetUser() payload: Payload,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getPaymentById(i18n, id, payload.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update payment by ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Payment ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async update(
    @I18n() i18n: I18nContext,
    @Param('id', ParseIntPipe) id: number,
    @GetUser() payload: Payload,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.update(i18n, id, payload, updatePaymentDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.create(i18n, payload, createPaymentDto);
  }

  @Post('vnpay/create-url')
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Create VNPay payment URL' })
  @ApiResponse({
    status: 201,
    description: 'VNPay payment URL created successfully',
    type: VnpayUrlResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createVnpayUrl(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Body() createVnpayUrlDto: CreateVnpayUrlDto,
    @Req() req: Request,
  ): Promise<VnpayUrlResponseDto> {
    return this.paymentService.createVnpayUrl(
      i18n,
      payload,
      createVnpayUrlDto,
      this.extractClientIp(req),
    );
  }

  @Get('vnpay/return')
  @ApiOperation({ summary: 'Handle VNPay return callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend result page' })
  async handleVnpayReturn(
    @I18n() i18n: I18nContext,
    @Query() query: Record<string, string | string[] | undefined>,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.paymentService.handleVnpayReturn(i18n, query);
    const baseUrl = this.configService.vnpayFrontendRedirectBaseUrl.replace(/\/$/, '');

    if (result.isSuccess) {
      const successUrl =
        `${baseUrl}/payment-success?orderId=${encodeURIComponent(String(result.orderId ?? ''))}` +
        `&paymentId=${encodeURIComponent(String(result.paymentId ?? ''))}` +
        `&amount=${encodeURIComponent(String(result.amount ?? '0'))}` +
        `&method=${encodeURIComponent(String(result.method ?? 'VNPAY'))}`;

      res.redirect(successUrl);
      return;
    }

    const failureUrl =
      `${baseUrl}/payment-failure?orderId=${encodeURIComponent(String(result.orderId ?? ''))}` +
      `&error=${encodeURIComponent(result.message || 'Payment failed')}`;

    res.redirect(failureUrl);
  }

  @Get('vnpay/ipn')
  @ApiOperation({ summary: 'Handle VNPay IPN callback' })
  @ApiResponse({ status: 200, description: 'IPN acknowledged' })
  async handleVnpayIpn(
    @I18n() i18n: I18nContext,
    @Query() query: Record<string, string | string[] | undefined>,
  ): Promise<{ RspCode: string; Message: string }> {
    return this.paymentService.handleVnpayIpn(i18n, query);
  }
}
