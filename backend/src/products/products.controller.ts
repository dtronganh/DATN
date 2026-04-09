import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuards } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/entities/user.entity';
import { ProductResponseDto } from './dto/product-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search products by name or description' })
  @ApiQuery({
    name: 'query',
    type: 'string',
    required: true,
    description: 'Search term',
    example: 'laptop',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Items per page',
    example: 20,
  })
  @ApiQuery({
    name: 'sort',
    type: 'string',
    required: false,
    description: 'Sort field and order (e.g., name:asc or price:desc)',
    example: 'name:asc',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchProducts(
    @Query('query') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.searchProducts(query, {
      page,
      limit,
      sort,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Items per page',
    example: 20,
  })
  @ApiQuery({
    name: 'sort',
    type: 'string',
    required: false,
    description: 'Sort field and order (e.g., name:asc or price:desc)',
    example: 'name:asc',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async getProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.getProducts({
      page,
      limit,
      sort,
    });
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get all products by category id with pagination' })
  @ApiParam({
    name: 'categoryId',
    type: 'number',
    description: 'Category ID',
    example: 1,
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Items per page',
    example: 20,
  })
  @ApiQuery({
    name: 'sort',
    type: 'string',
    required: false,
    description: 'Sort field and order (e.g., name:asc or price:desc)',
    example: 'name:asc',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async getProductsByCategory(
    @Param('categoryId') categoryId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.getProductsByCategory({
      page,
      limit,
      sort,
      categoryId,
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiParam({
    name: 'slug',
    type: 'string',
    description: 'Product slug',
    example: 'sample-product',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(@I18n() i18n: I18nContext, @Param('slug') slug: string) {
    return this.productsService.getProduct(i18n, slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createProduct(
    @I18n() i18n: I18nContext,
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.createProduct(i18n, createProductDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Product ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(
    @I18n() i18n: I18nContext,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.updateProduct(i18n, +id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Product ID',
    example: '1',
  })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(
    @I18n() i18n: I18nContext,
    @Param('id') id: string,
  ): Promise<void> {
    return this.productsService.deleteProduct(i18n, +id);
  }
}
