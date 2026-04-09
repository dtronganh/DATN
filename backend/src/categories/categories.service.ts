import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from 'src/common/base.service';
import {
  PaginatedResponse,
  PaginationRequest,
} from 'src/common/dto/paginate.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { IsNull, Repository, ILike } from 'typeorm';
import { CategoriesMapper } from './categories.mapper';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SlugService } from 'src/common/slug.service';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class CategoriesService extends BaseService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private slugService: SlugService,
  ) {
    super();
  }

  async getCategories(
    paginate: PaginationRequest,
  ): Promise<PaginatedResponse<CategoryResponseDto>> {
    return this.paginate<Category, CategoryResponseDto>({
      repository: this.categoryRepository,
      options: {
        where: {
          deletedAt: IsNull(),
        },
      },
      pagination: paginate,
      mapper: (item) => CategoriesMapper.toDto(item),
    });
  }

  async getCategory(
    i18n: I18nContext,
    slug: string,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: {
        slug: slug,
        deletedAt: IsNull(),
      },
    });
    if (category === null) {
      throw new NotFoundException(i18n.t('common.categories.errors.not_found'));
    }
    return CategoriesMapper.toDto(category);
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      description: createCategoryDto.description || null,
    });

    const savedCategory = await this.categoryRepository.save(category);
    const slug = this.slugService.generateSlug(
      savedCategory.name,
      savedCategory.id,
    );
    savedCategory.slug = slug;
    await this.categoryRepository.save(savedCategory);

    return CategoriesMapper.toDto(savedCategory);
  }

  async updateCategory(
    i18n: I18nContext,
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException(i18n.t('common.categories.errors.not_found'));
    }

    if (updateCategoryDto.name) {
      category.name = updateCategoryDto.name;
      const slug = this.slugService.generateSlug(category.name, category.id);
      category.slug = slug;
    }

    if (updateCategoryDto.description !== undefined) {
      category.description = updateCategoryDto.description;
    }

    await this.categoryRepository.save(category);
    return CategoriesMapper.toDto(category);
  }

  async deleteCategory(i18n: I18nContext, id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException(i18n.t('common.categories.errors.not_found'));
    }

    category.deletedAt = new Date();
    await this.categoryRepository.save(category);
  }

  async searchCategories(
    query: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<CategoryResponseDto>> {
    return this.paginate<Category, CategoryResponseDto>({
      repository: this.categoryRepository,
      options: {
        where: [
          { name: ILike(`%${query}%`), deletedAt: IsNull() },
          { description: ILike(`%${query}%`), deletedAt: IsNull() },
        ],
      },
      pagination: pagination,
      mapper: (item) => CategoriesMapper.toDto(item),
    });
  }
}
