import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { IsNull, Repository, ILike } from 'typeorm';
import { ProductResponseDto } from './dto/product-response.dto';
import { BaseService } from 'src/common/base.service';
import {
  PaginatedResponse,
  PaginationRequest,
} from 'src/common/dto/paginate.dto';
import { ProductsMapper } from './products.mapper';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SlugService } from 'src/common/slug.service';
import { Category } from 'src/categories/entities/category.entity';
import { I18nContext } from 'nestjs-i18n';
import { Mixin } from 'src/common/type';

@Injectable()
export class ProductsService extends BaseService {
  constructor(
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private slugService: SlugService,
  ) {
    super();
  }

  async getProducts(
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<ProductResponseDto>> {
    return this.paginate<Product, ProductResponseDto>({
      repository: this.productsRepository,
      options: {
        where: { deletedAt: IsNull() },
        relations: ['category'],
      },
      pagination: pagination,
      mapper: (item: Product) => ProductsMapper.toDto(item),
    });
  }

  async getProductsByCategory(
    pagination: Mixin<PaginationRequest, { categoryId: number }>,
  ): Promise<PaginatedResponse<ProductResponseDto>> {
    return this.paginate<Product, ProductResponseDto>({
      repository: this.productsRepository,
      options: {
        where: { deletedAt: IsNull(), category: { id: pagination.categoryId } },
        relations: ['category'],
      },
      pagination: pagination,
      mapper: (item: Product) => ProductsMapper.toDto(item),
    });
  }

  async getProduct(
    i18n: I18nContext,
    slug: string,
  ): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { slug: slug, deletedAt: IsNull() },
      relations: ['category'],
    });
    if (product === null) {
      throw new NotFoundException(
        i18n.t('common.products.errors.product_not_found'),
      );
    }
    return ProductsMapper.toDto(product);
  }

  async createProduct(
    i18n: I18nContext,
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException(
        i18n.t('common.products.errors.category_not_found'),
      );
    }

    const product = this.productsRepository.create({
      name: createProductDto.name,
      price: createProductDto.price,
      description: createProductDto.description || null,
      stock: createProductDto.stock,
      thumbnail: createProductDto.thumbnail || null,
      images: createProductDto.images || null,
      attributes: createProductDto.attributes || null,
      category: category,
    });

    const savedProduct = await this.productsRepository.save(product);
    const slug = this.slugService.generateSlug(
      savedProduct.name,
      savedProduct.id,
    );
    savedProduct.slug = slug;
    await this.productsRepository.save(savedProduct);

    return ProductsMapper.toDto(savedProduct);
  }

  async updateProduct(
    i18n: I18nContext,
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!product) {
      throw new NotFoundException(
        i18n.t('common.products.errors.product_not_found'),
      );
    }

    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId, deletedAt: IsNull() },
      });

      if (!category) {
        throw new NotFoundException(
          i18n.t('common.products.errors.category_not_found'),
        );
      }

      product.category = category;
    }

    if (updateProductDto.name) {
      product.name = updateProductDto.name;
      const slug = this.slugService.generateSlug(product.name, product.id);
      product.slug = slug;
    }

    if (updateProductDto.price !== undefined) {
      product.price = updateProductDto.price;
    }

    if (updateProductDto.description !== undefined) {
      product.description = updateProductDto.description;
    }

    if (updateProductDto.stock !== undefined) {
      product.stock = updateProductDto.stock;
    }

    if (updateProductDto.thumbnail !== undefined) {
      product.thumbnail = updateProductDto.thumbnail;
    }

    if (updateProductDto.images !== undefined) {
      product.images = updateProductDto.images;
    }

    if (updateProductDto.attributes !== undefined) {
      product.attributes = updateProductDto.attributes;
    }

    await this.productsRepository.save(product);
    return ProductsMapper.toDto(product);
  }

  async deleteProduct(i18n: I18nContext, id: number): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!product) {
      throw new NotFoundException(
        i18n.t('common.products.errors.product_not_found'),
      );
    }

    product.deletedAt = new Date();
    await this.productsRepository.save(product);
  }

  async searchProducts(
    query: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<ProductResponseDto>> {
    return this.paginate<Product, ProductResponseDto>({
      repository: this.productsRepository,
      options: {
        where: [
          { name: ILike(`%${query}%`), deletedAt: IsNull() },
          { description: ILike(`%${query}%`), deletedAt: IsNull() },
        ],
        relations: ['category'],
      },
      pagination: pagination,
      mapper: (item: Product) => ProductsMapper.toDto(item),
    });
  }
}
