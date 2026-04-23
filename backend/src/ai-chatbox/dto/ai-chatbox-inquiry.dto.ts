import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class AiChatboxHistoryItemDto {
  @IsString()
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string;
}

export class AiChatboxInquiryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => AiChatboxHistoryItemDto)
  history?: AiChatboxHistoryItemDto[];
}

export interface AiChatboxSuggestion {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  thumbnail: string | null;
}

export interface AiChatboxAnswerResult {
  answer: string;
  suggestions: AiChatboxSuggestion[];
}
