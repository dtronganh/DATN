import { IsDateString, IsIn, IsOptional } from 'class-validator';

export const DASHBOARD_METRICS = ['users', 'products', 'orders', 'revenue'] as const;
export type DashboardMetric = (typeof DASHBOARD_METRICS)[number];

export const DASHBOARD_GRANULARITIES = ['week', 'month', 'year'] as const;
export type DashboardGranularity = (typeof DASHBOARD_GRANULARITIES)[number];

export const DASHBOARD_EXPORT_MODES = ['snapshot', 'recalculation'] as const;
export type DashboardExportMode = (typeof DASHBOARD_EXPORT_MODES)[number];

export class AdminDashboardQueryDto {
  @IsOptional()
  @IsIn(DASHBOARD_METRICS)
  metric?: DashboardMetric;

  @IsOptional()
  @IsIn(DASHBOARD_GRANULARITIES)
  granularity?: DashboardGranularity;
}

export class AdminDashboardExportQueryDto extends AdminDashboardQueryDto {
  @IsOptional()
  @IsIn(DASHBOARD_EXPORT_MODES)
  mode?: DashboardExportMode;

  @IsOptional()
  @IsDateString()
  snapshotAt?: string;
}
