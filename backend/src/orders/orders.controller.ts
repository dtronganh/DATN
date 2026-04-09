import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuards } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/entities/user.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Payload } from 'src/common/payload';
import { CreatedOrderDto } from './dto/created-order.dto';
import { PaginatedResponse } from 'src/common/dto/paginate.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';
import { OrderDetailDto } from './dto/order-detail.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { PaginatedOrderResponseDto } from './dto/paginated-order-response.dto';
import {
  UpdateOrderStatusDto,
  UpdateOrderStatusRequestDto,
} from './dto/update-order-status.dto';
import { I18n, I18nContext } from 'nestjs-i18n';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created',
    type: CreatedOrderDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER)
  async create(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<CreatedOrderDto> {
    return await this.ordersService.create(i18n, payload, createOrderDto);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Search orders (Admin only)' })
  @ApiQuery({ name: 'query', type: String, required: true, description: 'Search term (name, phone, note, or status)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: PaginatedOrderResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async searchOrders(
    @Query('query') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('sort') sort?: string,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    return await this.ordersService.searchOrders(query, { page, limit, sort });
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: PaginatedOrderResponseDto,
  })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER, Role.ADMIN)
  async getOrders(
    @GetUser() payload: Payload,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('sort') sort?: string,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    return await this.ordersService.getOrders(payload, { page, limit, sort });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order found',
    type: OrderDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER, Role.ADMIN)
  async getOrderDetails(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Param('id') id: string,
  ): Promise<OrderDetailDto> {
    return await this.ordersService.getOrderDetails(i18n, payload, +id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cancel order by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled',
    type: CancelOrderDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER)
  async cancelOrder(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Param('id') id: string,
  ): Promise<CancelOrderDto> {
    return await this.ordersService.cancelOrder(i18n, payload, +id);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get order items with pagination' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of order items',
    type: PaginatedOrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER, Role.ADMIN)
  async getOrderItems(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('sort') sort?: string,
  ): Promise<PaginatedResponse<OrderItemResponseDto>> {
    return await this.ordersService.getOrderItems(i18n, payload, +id, {
      page,
      limit,
      sort,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated',
    type: UpdateOrderStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.ADMIN)
  async updateOrderStatus(
    @I18n() i18n: I18nContext,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusRequestDto,
  ): Promise<UpdateOrderStatusDto> {
    return await this.ordersService.updateOrderStatus(
      i18n,
      +id,
      updateStatusDto,
    );
  }
}
