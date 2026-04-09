import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { CartsService } from './carts.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Role } from 'src/users/entities/user.entity';
import { Payload } from 'src/common/payload';
import { CartResponseDto } from './dto/cart-response.dto';
import { RoleGuards } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { I18n, I18nContext } from 'nestjs-i18n';

@ApiTags('carts')
@ApiBearerAuth()
@Controller('carts')
@UseGuards(JwtAuthGuard, RoleGuards)
@Roles(Role.USER)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'User cart', type: CartResponseDto })
  async getCart(@GetUser() payload: Payload): Promise<CartResponseDto> {
    return this.cartsService.getCart(payload);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async addItem(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Body() createCartItemDto: CreateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartsService.addItem(i18n, payload, createCartItemDto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'itemId', type: Number, description: 'Cart item ID' })
  @ApiResponse({
    status: 200,
    description: 'Item updated',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async updateItem(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartsService.updateItem(i18n, payload, +itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'itemId', type: Number, description: 'Cart item ID' })
  @ApiResponse({
    status: 200,
    description: 'Item removed',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async removeItem(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Param('itemId') itemId: string,
  ): Promise<CartResponseDto> {
    return this.cartsService.removeItem(i18n, payload, +itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared',
    type: CartResponseDto,
  })
  async clearCart(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
  ): Promise<CartResponseDto> {
    return await this.cartsService.clearCart(i18n, payload);
  }
}
