import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
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
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Payload } from 'src/common/payload';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuards } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/entities/user.entity';
import { PaymentResponseDto } from './dto/payment-response.dto';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
}
