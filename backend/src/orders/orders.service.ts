import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, In, IsNull, Repository, ILike } from 'typeorm';
import { OrderItem } from './entities/order_item.entity';
import { Role, User } from 'src/users/entities/user.entity';
import { Address } from 'src/address/entities/address.entity';
import { Product } from 'src/products/entities/product.entity';
import { Payload } from 'src/common/payload';
import { CreatedOrderDto } from './dto/created-order.dto';
import { OrdersMapper } from './orders.mapper';
import {
  PaginatedResponse,
  PaginationRequest,
} from 'src/common/dto/paginate.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { BaseService } from 'src/common/base.service';
import { OrderDetailDto } from './dto/order-detail.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';
import { Status } from './entities/status.entity';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { FormattingService } from 'src/common/formatting.service';
import {
  UpdateOrderStatusDto,
  UpdateOrderStatusRequestDto,
} from './dto/update-order-status.dto';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class OrdersService extends BaseService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Address) private addressRepository: Repository<Address>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private dataSource: DataSource,
    private formattingService: FormattingService,
  ) {
    super();
  }

  async create(
    i18n: I18nContext,
    payload: Payload,
    dto: CreateOrderDto,
  ): Promise<CreatedOrderDto> {
    const address = await this.addressRepository.findOne({
      where: {
        deletedAt: IsNull(),
        id: dto.addressId,
        user: { id: payload.userId, deletedAt: IsNull() },
      },
      relations: ['user'],
    });
    if (!address) {
      throw new NotFoundException(
        i18n.t('common.orders.errors.address_not_found', {
          args: { id: dto.addressId },
        }),
      );
    }
    const products = await this.productRepository.find({
      where: {
        id: In(dto.products.map((p) => p.productId)),
        deletedAt: IsNull(),
      },
    });

    if (products.length !== dto.products.length) {
      throw new BadRequestException(
        i18n.t('common.orders.errors.product_not_found'),
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const requestItem of dto.products) {
      const product = productMap.get(requestItem.productId);
      if (!product) {
        throw new BadRequestException(
          i18n.t('common.orders.errors.product_not_found'),
        );
      }

      // Validate selectedAttributes if provided
      if (requestItem.selectedAttributes && requestItem.selectedAttributes.length > 0) {
        if (!product.attributes || product.attributes.length === 0) {
          throw new ConflictException(
            i18n.t('common.products.errors.no_attributes', {
              args: { id: requestItem.productId },
            }) || 'Product does not have any attributes',
          );
        }

        // Validate each selected attribute
        for (const selectedAttr of requestItem.selectedAttributes) {
          const productAttr = product.attributes.find(
            (attr) => attr.name === selectedAttr.name,
          );

          if (!productAttr) {
            throw new ConflictException(
              i18n.t('common.products.errors.invalid_attribute', {
                args: { name: selectedAttr.name },
              }) || `Invalid attribute: ${selectedAttr.name}`,
            );
          }

          if (!productAttr.values.includes(selectedAttr.value)) {
            throw new ConflictException(
              i18n.t('common.products.errors.invalid_attribute_value', {
                args: { value: selectedAttr.value, name: selectedAttr.name },
              }) || `Invalid value '${selectedAttr.value}' for attribute '${selectedAttr.name}'`,
            );
          }
        }

        // Check for duplicate attribute names
        const attrNames = requestItem.selectedAttributes.map((attr) => attr.name);
        if (new Set(attrNames).size !== attrNames.length) {
          throw new ConflictException(
            i18n.t('common.products.errors.duplicate_attributes') || 'Duplicate attribute names in selection',
          );
        }
      }

      if (product.stock < requestItem.quantity) {
        throw new BadRequestException(
          i18n.t('common.orders.errors.insufficient_stock', {
            args: { productId: requestItem.productId },
          }),
        );
      }
    }
    const user = await this.userRepository.findOneBy({ id: payload.userId });
    if (!user) {
      throw new NotFoundException(
        i18n.t('common.orders.errors.user_not_found'),
      );
    }
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);
      const productRepo = manager.getRepository(Product);
      let totalAmount = 0;
      const orderItemsData: Array<Partial<OrderItem>> = [];
      for (const requestItem of dto.products) {
        const product = productMap.get(requestItem.productId)!;
        const subtotal = Number(product.price) * requestItem.quantity;
        totalAmount += subtotal;
        orderItemsData.push({
          productId: product.id,
          quantity: requestItem.quantity,
          price: product.price,
          selectedAttributes: requestItem.selectedAttributes || null,
        });
      }
      const order = orderRepo.create({
        user,
        totalAmount,
        note: dto.note,
        receiverName: address.receiverName,
        receiverPhone: address.phone,
        receiverAddress: this.formattingService.formatAddress(address),
      });
      const savedOrder = await orderRepo.save(order);
      const createdItems = await orderItemRepo.save(
        orderItemsData.map((itemData) =>
          orderItemRepo.create({
            productId: itemData.productId,
            quantity: itemData.quantity,
            price: itemData.price,
            selectedAttributes: itemData.selectedAttributes,
            order: savedOrder,
          }),
        ),
      );
      for (const requestItem of dto.products) {
        await productRepo.decrement(
          { id: requestItem.productId },
          'stock',
          requestItem.quantity,
        );
      }
      return OrdersMapper.toCustomDto(savedOrder, createdItems);
    });
  }

  async getOrders(
    payload: Payload,
    request: PaginationRequest,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    return await this.paginate<Order, OrderResponseDto>({
      repository: this.orderRepository,
      options: {
        where: {
          deletedAt: IsNull(),
          user:
            payload.role === Role.ADMIN
              ? undefined
              : {
                  id: payload.userId,
                  deletedAt: IsNull(),
                },
        },
        relations: ['orderItems', 'user'],
      },
      pagination: request,
      mapper: (item) => OrdersMapper.toDto(item),
    });
  }

  async getOrderDetails(
    i18n: I18nContext,
    payload: Payload,
    id: number,
  ): Promise<OrderDetailDto> {
    const [data, total] = await this.orderRepository.findAndCount({
      where: {
        id: id,
        deletedAt: IsNull(),
        user:
          payload.role === Role.ADMIN
            ? undefined
            : {
                id: payload.userId,
                deletedAt: IsNull(),
              },
      },
      relations: ['user'],
    });
    if (data.length === 0) {
      throw new NotFoundException(
        i18n.t('common.orders.errors.order_not_found'),
      );
    }
    const order = data[0];
    const orderItems = await this.orderItemRepository.find({
      where: { order: { id }, deletedAt: IsNull() },
      take: 2,
    });
    const productIds = orderItems.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: {
        id: In(productIds),
        deletedAt: IsNull(),
      },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));
    const previews: Array<OrderItemResponseDto> = orderItems.map((item) =>
      OrdersMapper.toOrderItemResponseDto(item, productMap.get(item.productId)),
    );

    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      note: order.note,
      receiverAddress: order.receiverAddress,
      receiverName: order.receiverName,
      receiverPhone: order.receiverPhone,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      previews,
      itemCount: total,
    };
  }

  async cancelOrder(
    i18n: I18nContext,
    payload: Payload,
    id: number,
  ): Promise<CancelOrderDto> {
    const order = await this.orderRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
        user: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      },
      relations: ['user', 'orderItems'],
    });
    if (order === null) {
      throw new NotFoundException(
        i18n.t('common.orders.errors.order_not_found'),
      );
    }
    if (order.status === Status.SHIPPED || order.status === Status.CANCELLED) {
      throw new ConflictException(
        i18n.t('common.orders.errors.cannot_cancel_completed_order'),
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const productRepo = manager.getRepository(Product);

      await orderRepo.update(id, {
        status: Status.CANCELLED,
      });

      const orderItems = order.orderItems;
      for (const item of orderItems) {
        await productRepo.increment(
          { id: item.productId },
          'stock',
          item.quantity,
        );
      }

      return {
        id: order.id,
        status: Status.CANCELLED,
        cancelledAt: new Date(),
      };
    });
  }

  async getOrderItems(
    i18n: I18nContext,
    payload: Payload,
    id: number,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<OrderItemResponseDto>> {
    const { page, limit, sort } = pagination;
    const [rawField, rawOrder] = sort?.split(':') ?? ['createdAt', 'DESC'];
    const sortField = rawField as keyof OrderItem;
    const sortOrder = (rawOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as
      | 'ASC'
      | 'DESC';
    const order = await this.orderRepository.findOne({
      where: {
        id: id,
        deletedAt: IsNull(),
        user:
          payload.role === Role.ADMIN
            ? undefined
            : {
                id: payload.userId,
                deletedAt: IsNull(),
              },
      },
      relations: ['user'],
    });
    if (order === null) {
      throw new NotFoundException(
        i18n.t('common.orders.errors.order_not_found'),
      );
    }
    const [orderItems, total] = await this.orderItemRepository.findAndCount({
      where: { order: { id } },
      skip: (page - 1) * limit,
      take: limit,
      order: this.buildOrder(sortField, sortOrder),
    });
    const productIds = orderItems.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: {
        id: In(productIds),
        deletedAt: IsNull(),
      },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));
    const result: Array<OrderItemResponseDto> = orderItems.map((item) =>
      OrdersMapper.toOrderItemResponseDto(item, productMap.get(item.productId)),
    );
    return {
      data: result,
      meta: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateOrderStatus(
    i18n: I18nContext,
    id: number,
    updateStatusDto: UpdateOrderStatusRequestDto,
  ): Promise<UpdateOrderStatusDto> {
    const order = await this.orderRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!order) {
      throw new NotFoundException(
        i18n.t('common.orders.errors.order_not_found'),
      );
    }

    const validTransitions: Record<Status, Status[]> = {
      [Status.PENDING]: [Status.PAID, Status.CANCELLED],
      [Status.PAID]: [Status.SHIPPED],
      [Status.SHIPPED]: [],
      [Status.CANCELLED]: [],
    };

    const allowedStatuses = validTransitions[order.status];
    if (!allowedStatuses.includes(updateStatusDto.status)) {
      throw new ConflictException(
        i18n.t('common.orders.errors.invalid_status_transition', {
          args: { from: order.status, to: updateStatusDto.status },
        }),
      );
    }

    await this.orderRepository.update(id, {
      status: updateStatusDto.status,
    });

    return {
      id: order.id,
      status: updateStatusDto.status,
      updatedAt: new Date(),
    };
  }

  async searchOrders(
    query: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    return await this.paginate<Order, OrderResponseDto>({
      repository: this.orderRepository,
      options: {
        where: [
          { receiverName: ILike(`%${query}%`), deletedAt: IsNull() },
          { receiverPhone: ILike(`%${query}%`), deletedAt: IsNull() },
          { note: ILike(`%${query}%`), deletedAt: IsNull() },
          { status: query as any, deletedAt: IsNull() },
        ],
        relations: ['orderItems', 'user'],
      },
      pagination: pagination,
      mapper: (item) => OrdersMapper.toDto(item),
    });
  }
}
