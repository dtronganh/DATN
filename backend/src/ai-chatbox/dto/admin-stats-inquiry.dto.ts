import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

const METRICS = ['users', 'products', 'orders', 'revenue'] as const;
const GRANULARITIES = ['week', 'month', 'year'] as const;
const MODES = ['snapshot', 'recalculation'] as const;

export class AdminStatsInquiryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question: string;

  @IsOptional()
  @IsIn(METRICS)
  metric?: (typeof METRICS)[number];

  @IsOptional()
  @IsIn(GRANULARITIES)
  granularity?: (typeof GRANULARITIES)[number];

  @IsOptional()
  @IsIn(MODES)
  mode?: (typeof MODES)[number];

  @IsOptional()
  @IsDateString()
  snapshotAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}

export interface AdminStatsInquiryResult {
  answer: string;
  generatedAt: string;
}
