import { Order } from './order.model';
import { Product } from './product.model';

export type DashboardMetric = 'users' | 'products' | 'orders' | 'revenue';
export type DashboardGranularity = 'week' | 'month' | 'year';
export type DashboardExportMode = 'snapshot' | 'recalculation';

export interface DashboardChartPoint {
  key: string;
  label: string;
  value: number;
  deletedCount?: number;
}

export interface DashboardOverview {
  generatedAt: string;
  range: {
    granularity: DashboardGranularity;
    startDate: string;
    endDate: string;
  };
  stats: {
    users: number;
    products: number;
    orders: number;
    revenue: number;
  };
  chart: {
    metric: DashboardMetric;
    granularity: DashboardGranularity;
    points: DashboardChartPoint[];
    totalInRange: number;
    growthPercent: number;
    peakValue: number;
  };
  recentOrders: Array<Pick<Order, 'id' | 'status' | 'totalAmount' | 'itemCount' | 'receiverName' | 'createdAt'>>;
  recentProducts: Array<Pick<Product, 'id' | 'name' | 'price' | 'stock' | 'thumbnail' | 'createdAt' | 'updatedAt'>>;
}

export interface AdminStatsAiInquiryPayload {
  question: string;
  metric?: DashboardMetric;
  granularity?: DashboardGranularity;
  mode?: DashboardExportMode;
  snapshotAt?: string;
  locale?: string;
}

export interface AdminStatsAiInquiryResponse {
  answer: string;
  generatedAt: string;
}
