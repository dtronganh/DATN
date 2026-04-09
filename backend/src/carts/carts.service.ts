import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart_item.entity';
import { Payload } from 'src/common/payload';
import { Product } from 'src/products/entities/product.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartsMapper } from './carts.mapper';
import { CartResponseDto } from './dto/cart-response.dto';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getCart(payload: Payload): Promise<CartResponseDto> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: payload.userId } },
      relations: ['user', 'cartItems', 'cartItems.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user: { id: payload.userId } });
      await this.cartRepository.save(cart);
    }

    return CartsMapper.toDto(cart);
  }

  async addItem(
    i18n: I18nContext,
    payload: Payload,
    createCartItemDto: CreateCartItemDto,
  ): Promise<CartResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id: createCartItemDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        i18n.t('common.products.errors.not_found', {
          args: { id: createCartItemDto.productId },
        }),
      );
    }
    if (product.stock < createCartItemDto.quantity) {
      throw new ConflictException(
        i18n.t('common.products.errors.insufficient_stock', {
          args: { id: createCartItemDto.productId },
        }),
      );
    }

    if (createCartItemDto.selectedAttributes && createCartItemDto.selectedAttributes.length > 0) {
      if (!product.attributes || product.attributes.length === 0) {
        throw new ConflictException(
          i18n.t('common.products.errors.no_attributes', {
            args: { id: createCartItemDto.productId },
          }) || 'Product does not have any attributes',
        );
      }

      for (const selectedAttr of createCartItemDto.selectedAttributes) {
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

      const attrNames = createCartItemDto.selectedAttributes.map((attr) => attr.name);
      if (new Set(attrNames).size !== attrNames.length) {
        throw new ConflictException(
          i18n.t('common.products.errors.duplicate_attributes') || 'Duplicate attribute names in selection',
        );
      }
    }

    let cart = await this.cartRepository.findOne({
      where: { user: { id: payload.userId } },
      relations: ['cartItems'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user: { id: payload.userId } });
      await this.cartRepository.save(cart);
    }

    // Find existing item with same product and attributes
    const cartItems = await this.cartItemRepository.find({
      where: { cart: { id: cart.id }, product: { id: product.id } },
    });

    const selectedAttrsJson = createCartItemDto.selectedAttributes 
      ? JSON.stringify(createCartItemDto.selectedAttributes.sort((a, b) => a.name.localeCompare(b.name)))
      : null;

    const existingItem = cartItems.find((item) => {
      const itemAttrsJson = item.selectedAttributes
        ? JSON.stringify(item.selectedAttributes.sort((a, b) => a.name.localeCompare(b.name)))
        : null;
      return itemAttrsJson === selectedAttrsJson;
    });

    if (existingItem) {
      existingItem.quantity += createCartItemDto.quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cart,
        product,
        quantity: createCartItemDto.quantity,
        selectedAttributes: createCartItemDto.selectedAttributes || null,
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.getCart(payload);
  }

  async updateItem(
    i18n: I18nContext,
    payload: Payload,
    itemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart', 'cart.user'],
    });

    if (!cartItem || cartItem.cart.user.id !== payload.userId) {
      throw new NotFoundException(i18n.t('common.carts.errors.item_not_found'));
    }

    if (updateCartItemDto.quantity === 0) {
      await this.cartItemRepository.remove(cartItem);
    } else {
      cartItem.quantity = updateCartItemDto.quantity;
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCart(payload);
  }

  async removeItem(
    i18n: I18nContext,
    payload: Payload,
    itemId: number,
  ): Promise<CartResponseDto> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart', 'cart.user'],
    });

    if (!cartItem || cartItem.cart.user.id !== payload.userId) {
      throw new NotFoundException(i18n.t('common.carts.errors.item_not_found'));
    }

    await this.cartItemRepository.remove(cartItem);
    return this.getCart(payload);
  }

  async clearCart(i18n: I18nContext, payload: Payload): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: payload.userId } },
      relations: ['cartItems'],
    });

    if (!cart) {
      throw new NotFoundException(i18n.t('common.carts.errors.cart_not_found'));
    }

    await this.cartItemRepository.remove(cart.cartItems);
    return this.getCart(payload);
  }
}
