import { ProductResponseDto } from './dto/product-response.dto';
import { Product } from './entities/product.entity';

export class ProductsMapper {
  static toDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      description: product.description,
      stock: product.stock,
      thumbnail: product.thumbnail,
      images: product.images,
      attributes: product.attributes,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryId: product.category?.id,
    };
  }
}
