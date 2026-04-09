import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Payload } from 'src/common/payload';
import { Product } from 'src/products/entities/product.entity';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { WishlistMapper } from './wishlist.mapper';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private wishlistItemRepository: Repository<WishlistItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getWishlist(payload: Payload): Promise<WishlistResponseDto> {
    let wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: payload.userId } },
      relations: ['user', 'wishlistItems', 'wishlistItems.product'],
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({ user: { id: payload.userId } });
      await this.wishlistRepository.save(wishlist);
    }

    return WishlistMapper.toDto(wishlist);
  }

  async addItem(
    i18n: I18nContext,
    payload: Payload,
    createWishlistItemDto: CreateWishlistItemDto,
  ): Promise<WishlistResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id: createWishlistItemDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        i18n.t('common.products.errors.not_found', {
          args: { id: createWishlistItemDto.productId },
        }),
      );
    }

    let wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: payload.userId } },
      relations: ['wishlistItems'],
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({ user: { id: payload.userId } });
      await this.wishlistRepository.save(wishlist);
    }

    // Check if product already exists in wishlist
    const existingItem = await this.wishlistItemRepository.findOne({
      where: { 
        wishlist: { id: wishlist.id }, 
        product: { id: product.id } 
      },
    });

    if (existingItem) {
      throw new ConflictException(
        i18n.t('common.wishlists.errors.item_already_exists') || 'Product already in wishlist',
      );
    }

    const newItem = this.wishlistItemRepository.create({
      wishlist,
      product,
    });
    await this.wishlistItemRepository.save(newItem);

    return this.getWishlist(payload);
  }

  async removeItem(
    i18n: I18nContext,
    payload: Payload,
    itemId: number,
  ): Promise<WishlistResponseDto> {
    const wishlistItem = await this.wishlistItemRepository.findOne({
      where: { id: itemId },
      relations: ['wishlist', 'wishlist.user'],
    });

    if (!wishlistItem || wishlistItem.wishlist.user.id !== payload.userId) {
      throw new NotFoundException(
        i18n.t('common.wishlists.errors.item_not_found') || 'Wishlist item not found',
      );
    }

    await this.wishlistItemRepository.remove(wishlistItem);
    return this.getWishlist(payload);
  }

  async clearWishlist(
    i18n: I18nContext,
    payload: Payload,
  ): Promise<WishlistResponseDto> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: payload.userId } },
      relations: ['wishlistItems'],
    });

    if (!wishlist) {
      throw new NotFoundException(
        i18n.t('common.wishlists.errors.wishlist_not_found') || 'Wishlist not found',
      );
    }

    await this.wishlistItemRepository.remove(wishlist.wishlistItems);
    return this.getWishlist(payload);
  }
}
