import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Role } from 'src/users/entities/user.entity';
import { Payload } from 'src/common/payload';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { RoleGuards } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { I18n, I18nContext } from 'nestjs-i18n';

@ApiTags('wishlists')
@ApiBearerAuth()
@Controller('wishlists')
@UseGuards(JwtAuthGuard, RoleGuards)
@Roles(Role.USER)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({ status: 200, description: 'User wishlist', type: WishlistResponseDto })
  async getWishlist(@GetUser() payload: Payload): Promise<WishlistResponseDto> {
    return this.wishlistService.getWishlist(payload);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to wishlist' })
  @ApiResponse({
    status: 201,
    description: 'Item added to wishlist',
    type: WishlistResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Item already in wishlist' })
  async addItem(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Body() createWishlistItemDto: CreateWishlistItemDto,
  ): Promise<WishlistResponseDto> {
    return this.wishlistService.addItem(i18n, payload, createWishlistItemDto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from wishlist' })
  @ApiParam({ name: 'itemId', type: Number, description: 'Wishlist item ID' })
  @ApiResponse({
    status: 200,
    description: 'Item removed',
    type: WishlistResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async removeItem(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Param('itemId') itemId: string,
  ): Promise<WishlistResponseDto> {
    return this.wishlistService.removeItem(i18n, payload, +itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from wishlist' })
  @ApiResponse({
    status: 200,
    description: 'Wishlist cleared',
    type: WishlistResponseDto,
  })
  async clearWishlist(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
  ): Promise<WishlistResponseDto> {
    return await this.wishlistService.clearWishlist(i18n, payload);
  }
}
