import { Injectable, BadRequestException } from '@nestjs/common';
import slugify from 'slugify';

@Injectable()
export class SlugService {
  generateSlug(text: string, id: number): string {
    const baseSlug = slugify(text, {
      lower: true,
      strict: true,
      trim: true,
    });

    return `${baseSlug}-${id}`;
  }

  extractId(slug: string): number {
    const match = slug.match(/-(\d+)$/);

    if (!match) {
      throw new BadRequestException('Invalid slug format: ID not found');
    }

    const id = Number(match[1]);

    if (isNaN(id)) {
      throw new BadRequestException('Invalid slug format: ID is not a number');
    }

    return id;
  }

  isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*-\d+$/.test(slug);
  }
}
