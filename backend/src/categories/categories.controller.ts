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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginatedCategoryResponseDto } from './dto/paginated-category-response.dto';
import { PaginatedResponse } from 'src/common/dto/paginate.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuards } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/entities/user.entity';
import { I18n, I18nContext } from 'nestjs-i18n';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search categories by name or description (Admin only)' })
  @ApiQuery({ name: 'query', type: String, required: true, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: PaginatedCategoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async searchCategories(
    @Query('query') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('sort') sort?: string,
  ): Promise<PaginatedResponse<CategoryResponseDto>> {
    return this.categoriesService.searchCategories(query, {
      page,
      limit,
      sort,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    type: PaginatedCategoryResponseDto,
  })
  async getCategories(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('sort') sort?: string,
  ): Promise<PaginatedResponse<CategoryResponseDto>> {
    return this.categoriesService.getCategories({
      page,
      limit,
      sort,
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', type: String, description: 'Category slug' })
  @ApiResponse({
    status: 200,
    description: 'Category found',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategory(
    @I18n() i18n: I18nContext,
    @Param('slug') slug: string,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.getCategory(i18n, slug);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.ADMIN)
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.ADMIN)
  async updateCategory(
    @I18n() i18n: I18nContext,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.updateCategory(i18n, +id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.ADMIN)
  async deleteCategory(
    @I18n() i18n: I18nContext,
    @Param('id') id: string,
  ): Promise<void> {
    return this.categoriesService.deleteCategory(i18n, +id);
  }
}
