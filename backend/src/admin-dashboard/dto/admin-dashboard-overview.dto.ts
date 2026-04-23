import { Status } from 'src/orders/entities/status.entity';
import {
  DashboardGranularity,
  DashboardMetric,
} from './admin-dashboard-query.dto';

export interface DashboardStatsSummary {
  users: number;
  products: number;
  orders: number;
  revenue: number;
}

export interface DashboardChartPoint {
  key: string;
  label: string;
  value: number;
  deletedCount?: number;
}

export interface DashboardChartPayload {
  metric: DashboardMetric;
  granularity: DashboardGranularity;
  points: DashboardChartPoint[];
  totalInRange: number;
  growthPercent: number;
  peakValue: number;
}

export interface DashboardRecentOrder {
  id: number;
  status: Status | string;
  totalAmount: number;
  itemCount: number;
  receiverName: string;
  createdAt: Date;
}

export interface DashboardRecentProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  thumbnail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardDailyProductDetail {
  key: string;
  label: string;
  uploadedCount: number;
  deletedCount: number;
  uploadedProducts: Array<{ id: number; name: string }>;
  deletedProducts: Array<{ id: number; name: string }>;
}

export interface DashboardOverviewDto {
  generatedAt: string;
  range: {
    granularity: DashboardGranularity;
    startDate: string;
    endDate: string;
  };
  stats: DashboardStatsSummary;
  chart: DashboardChartPayload;
  recentOrders: DashboardRecentOrder[];
  recentProducts: DashboardRecentProduct[];
  dailyProductDetails: DashboardDailyProductDetail[];
}
