import { CategoryResponseDto } from './dto/category-response.dto';
import { Category } from './entities/category.entity';

export class CategoriesMapper {
  static toDto(entity: Category): CategoryResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
