import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  /**
   * All fields from CreateProductDto are optional
   * Includes: name, price, description, stock, thumbnail, categoryId
   */
}
