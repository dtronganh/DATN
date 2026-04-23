import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderItem } from 'src/orders/entities/order_item.entity';
import { Status } from 'src/orders/entities/status.entity';
import {
  AdminDashboardExportQueryDto,
  AdminDashboardQueryDto,
  DashboardExportMode,
  DashboardGranularity,
  DashboardMetric,
} from './dto/admin-dashboard-query.dto';
import {
  DashboardChartPoint,
  DashboardDailyProductDetail,
  DashboardOverviewDto,
  DashboardRecentOrder,
  DashboardRecentProduct,
} from './dto/admin-dashboard-overview.dto';

const REVENUE_RECOGNIZED_STATUSES = new Set(['SHIPPED', 'COMPLETED']);

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async getOverview(query: AdminDashboardQueryDto): Promise<DashboardOverviewDto> {
    const metric: DashboardMetric = query.metric ?? 'users';
    const granularity: DashboardGranularity = query.granularity ?? 'week';

    const referenceTime = new Date();

    return this.buildOverview(metric, granularity, referenceTime);
  }

  async exportExcel(query: AdminDashboardExportQueryDto): Promise<{ buffer: Buffer; fileName: string }> {
    const metric: DashboardMetric = query.metric ?? 'users';
    const granularity: DashboardGranularity = query.granularity ?? 'month';
    const mode: DashboardExportMode = query.mode ?? 'recalculation';

    const referenceTime = this.resolveExportReferenceTime(mode, query.snapshotAt);
    const overview = await this.buildOverview(metric, granularity, referenceTime);

    const workbook = XLSX.utils.book_new();

    const summaryRows = [
      { Metric: 'Generated At', Value: overview.generatedAt },
      { Metric: 'Mode', Value: mode },
      { Metric: 'Reference Time', Value: referenceTime.toISOString() },
      { Metric: 'Metric', Value: metric },
      { Metric: 'Granularity', Value: granularity },
      { Metric: 'Range Start', Value: overview.range.startDate },
      { Metric: 'Range End', Value: overview.range.endDate },
      { Metric: 'Total in Range', Value: overview.chart.totalInRange },
      { Metric: 'Growth Percent', Value: overview.chart.growthPercent },
      { Metric: 'Peak Value', Value: overview.chart.peakValue },
      { Metric: 'Total Users', Value: overview.stats.users },
      { Metric: 'Total Products', Value: overview.stats.products },
      { Metric: 'Total Orders', Value: overview.stats.orders },
      { Metric: 'Total Revenue', Value: overview.stats.revenue },
    ];

    const growthRows = overview.chart.points
      .map((point) => ({
        Bucket: point.key,
        Label: point.label,
        Value: point.value,
        DeletedProducts: point.deletedCount ?? 0,
      }))
      .filter((row) => row.Value > 0 || row.DeletedProducts > 0);

    const productDetailRows = overview.dailyProductDetails
      .map((detail) => ({
        Bucket: detail.key,
        Label: detail.label,
        UploadedCount: detail.uploadedCount,
        DeletedCount: detail.deletedCount,
        UploadedProductIds: detail.uploadedProducts.map((item) => item.id).join(', '),
        UploadedProductNames: detail.uploadedProducts.map((item) => item.name).join(' | '),
        DeletedProductIds: detail.deletedProducts.map((item) => item.id).join(', '),
        DeletedProductNames: detail.deletedProducts.map((item) => item.name).join(' | '),
      }))
      .filter((row) => row.UploadedCount > 0 || row.DeletedCount > 0);

    const recentOrderRows = overview.recentOrders.map((order) => ({
      OrderId: order.id,
      Status: order.status,
      TotalAmount: order.totalAmount,
      ItemCount: order.itemCount,
      ReceiverName: order.receiverName,
      CreatedAt: this.toIsoString(order.createdAt),
    }));

    const recentProductRows = overview.recentProducts.map((product) => ({
      ProductId: product.id,
      Name: product.name,
      Price: product.price,
      Stock: product.stock,
      CreatedAt: this.toIsoString(product.createdAt),
      UpdatedAt: this.toIsoString(product.updatedAt),
    }));

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), 'Summary');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(growthRows), 'GrowthChart');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(productDetailRows), 'ProductDailyDetails');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(recentOrderRows), 'RecentOrders');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(recentProductRows), 'RecentProducts');

    const fileName = `dashboard-stats-${referenceTime.getFullYear()}-${String(referenceTime.getMonth() + 1).padStart(2, '0')}-${String(referenceTime.getDate()).padStart(2, '0')}.xlsx`;

    const uintArray = XLSX.write(workbook, {
      type: 'array',
      bookType: 'xlsx',
    }) as Uint8Array;

    return {
      buffer: Buffer.from(uintArray),
      fileName,
    };
  }

  buildRuleBasedInsight(question: string, overview: DashboardOverviewDto, locale: 'vi' | 'en' = 'vi'): string {
    const normalized = this.normalizeText(question);

    const chartPoints = overview.chart.points;
    const maxPoint = chartPoints.reduce<DashboardChartPoint | null>((acc, point) => {
      if (!acc || point.value > acc.value) return point;
      return acc;
    }, null);

    const deletedInRange = chartPoints.reduce((sum, point) => sum + Number(point.deletedCount ?? 0), 0);
    const trendWord =
      overview.chart.growthPercent > 0
        ? locale === 'en'
          ? 'increasing'
          : 'tăng'
        : overview.chart.growthPercent < 0
          ? locale === 'en'
            ? 'decreasing'
            : 'giảm'
          : locale === 'en'
            ? 'stable'
            : 'ổn định';

    const linesVi: string[] = [
      `Tổng quan hiện tại: ${overview.stats.users} người dùng, ${overview.stats.products} sản phẩm active, ${overview.stats.orders} đơn hàng, doanh thu ghi nhận ${this.formatNumber(overview.stats.revenue)} VNĐ.`,
      `Trong phạm vi ${overview.range.granularity}, chỉ số ${overview.chart.metric} có tổng ${this.formatNumber(overview.chart.totalInRange)}, xu hướng ${trendWord} (${overview.chart.growthPercent.toFixed(2)}%), đỉnh ${this.formatNumber(overview.chart.peakValue)}${maxPoint ? ` tại ${maxPoint.label}` : ''}.`,
    ];

    const linesEn: string[] = [
      `Current snapshot: ${overview.stats.users} users, ${overview.stats.products} active products, ${overview.stats.orders} orders, recognized revenue ${this.formatNumber(overview.stats.revenue)} VND.`,
      `In the ${overview.range.granularity} range, metric ${overview.chart.metric} totals ${this.formatNumber(overview.chart.totalInRange)}, trend is ${trendWord} (${overview.chart.growthPercent.toFixed(2)}%), peak ${this.formatNumber(overview.chart.peakValue)}${maxPoint ? ` at ${maxPoint.label}` : ''}.`,
    ];

    if (normalized.includes('xoa') || normalized.includes('deleted') || normalized.includes('remove')) {
      linesVi.push(`Sản phẩm bị xóa trong phạm vi đang chọn: ${deletedInRange}.`);
      linesEn.push(`Deleted products in selected range: ${deletedInRange}.`);
    }

    if (normalized.includes('doanh thu') || normalized.includes('revenue')) {
      linesVi.push('Doanh thu đang được ghi nhận theo đơn có trạng thái SHIPPED/COMPLETED.');
      linesEn.push('Revenue is recognized from SHIPPED/COMPLETED orders.');
    }

    if (normalized.includes('goi y') || normalized.includes('gợi ý') || normalized.includes('recommend')) {
      linesVi.push('Gợi ý hành động: theo dõi ngày đỉnh/đáy của biểu đồ và so sánh với lượng sản phẩm mới để tối ưu chiến dịch bán hàng.');
      linesEn.push('Action suggestion: compare peak/trough chart days with product upload patterns to optimize campaigns.');
    }

    return (locale === 'en' ? linesEn : linesVi).join('\n');
  }

  private async buildOverview(
    metric: DashboardMetric,
    granularity: DashboardGranularity,
    referenceTime: Date,
  ): Promise<DashboardOverviewDto> {
    const [users, products, orders] = await Promise.all([
      this.userRepository.find({ withDeleted: true }),
      this.productRepository.find({ withDeleted: true }),
      this.orderRepository.find({ withDeleted: true }),
    ]);

    const activeUsers = users.filter((item) => this.isActiveAt(item.createdAt, item.deletedAt, referenceTime));
    const activeProducts = products.filter((item) => this.isActiveAt(item.createdAt, item.deletedAt, referenceTime));
    const activeOrders = orders.filter((item) => this.isActiveAt(item.createdAt, item.deletedAt, referenceTime));

    const stats = {
      users: activeUsers.length,
      products: activeProducts.length,
      orders: activeOrders.length,
      revenue: activeOrders
        .filter((item) => this.isRevenueRecognized(item.status))
        .reduce((sum, item) => sum + Number(item.totalAmount ?? 0), 0),
    };

    const now = this.startOfDay(referenceTime);
    const rangeStart = this.getRangeStart(granularity, now);

    const chartPoints = this.buildChartPoints(metric, granularity, rangeStart, now, users, products, orders);
    const chartValues = chartPoints.map((point) => Number(point.value ?? 0));
    const firstValue = chartValues[0] ?? 0;
    const lastValue = chartValues[chartValues.length - 1] ?? 0;

    const growthPercent =
      firstValue === 0
        ? lastValue > 0
          ? 100
          : 0
        : ((lastValue - firstValue) / firstValue) * 100;

    const dailyProductDetails = this.buildDailyProductDetails(products, granularity, rangeStart, now);

    const recentOrders = await this.buildRecentOrders(referenceTime);
    const recentProducts = this.buildRecentProducts(products, referenceTime);

    return {
      generatedAt: referenceTime.toISOString(),
      range: {
        granularity,
        startDate: rangeStart.toISOString(),
        endDate: now.toISOString(),
      },
      stats,
      chart: {
        metric,
        granularity,
        points: chartPoints,
        totalInRange: chartValues.reduce((sum, value) => sum + value, 0),
        growthPercent,
        peakValue: chartValues.length > 0 ? Math.max(...chartValues) : 0,
      },
      recentOrders,
      recentProducts,
      dailyProductDetails,
    };
  }

  private buildChartPoints(
    metric: DashboardMetric,
    granularity: DashboardGranularity,
    rangeStart: Date,
    rangeEnd: Date,
    users: User[],
    products: Product[],
    orders: Order[],
  ): DashboardChartPoint[] {
    const grouped = new Map<string, number>();
    const deletedGrouped = new Map<string, number>();

    const template = this.buildRangeTemplate(granularity, rangeStart, rangeEnd);

    template.forEach((key) => {
      grouped.set(key, 0);
      deletedGrouped.set(key, 0);
    });

    const addMetricValue = (dateValue: Date | null | undefined, amount = 1): void => {
      const date = this.toDate(dateValue);
      if (!date) return;

      const pointDate = this.startOfDay(date);
      if (pointDate < rangeStart || pointDate > rangeEnd) return;

      const bucket = granularity === 'year' ? this.toMonthKey(pointDate) : this.toDayKey(pointDate);
      if (!grouped.has(bucket)) return;
      grouped.set(bucket, (grouped.get(bucket) ?? 0) + amount);
    };

    if (metric === 'users') {
      users.forEach((item) => addMetricValue(item.createdAt, 1));
    } else if (metric === 'products') {
      products.forEach((item) => addMetricValue(item.createdAt, 1));
      products.forEach((item) => {
        const deletedDate = this.toDate(item.deletedAt);
        if (!deletedDate) return;

        const pointDate = this.startOfDay(deletedDate);
        if (pointDate < rangeStart || pointDate > rangeEnd) return;

        const bucket = granularity === 'year' ? this.toMonthKey(pointDate) : this.toDayKey(pointDate);
        if (!deletedGrouped.has(bucket)) return;
        deletedGrouped.set(bucket, (deletedGrouped.get(bucket) ?? 0) + 1);
      });
    } else if (metric === 'orders') {
      orders.forEach((item) => addMetricValue(item.createdAt, 1));
    } else {
      orders
        .filter((item) => this.isRevenueRecognized(item.status))
        .forEach((item) => addMetricValue(item.createdAt, Number(item.totalAmount ?? 0)));
    }

    return Array.from(grouped.entries()).map(([key, value]) => ({
      key,
      label: this.formatBucketLabel(key, granularity),
      value,
      deletedCount: deletedGrouped.get(key) ?? 0,
    }));
  }

  private buildDailyProductDetails(
    products: Product[],
    granularity: DashboardGranularity,
    rangeStart: Date,
    rangeEnd: Date,
  ): DashboardDailyProductDetail[] {
    const uploadedByDay = new Map<string, Array<{ id: number; name: string }>>();
    const deletedByDay = new Map<string, Array<{ id: number; name: string }>>();

    const append = (
      map: Map<string, Array<{ id: number; name: string }>>,
      dayKey: string,
      product: Product,
    ): void => {
      const current = map.get(dayKey) ?? [];
      current.push({ id: product.id, name: String(product.name ?? '') });
      map.set(dayKey, current);
    };

    const addIfInRange = (
      target: Map<string, Array<{ id: number; name: string }>>,
      value: Date | null | undefined,
      product: Product,
    ): void => {
      const date = this.toDate(value);
      if (!date) return;

      const day = this.startOfDay(date);
      if (day < rangeStart || day > rangeEnd) return;

      const key = granularity === 'year' ? this.toMonthKey(day) : this.toDayKey(day);
      append(target, key, product);
    };

    products.forEach((item) => {
      addIfInRange(uploadedByDay, item.createdAt, item);
      addIfInRange(deletedByDay, item.deletedAt, item);
    });

    const keys = Array.from(new Set([...uploadedByDay.keys(), ...deletedByDay.keys()])).sort((a, b) =>
      a > b ? 1 : -1,
    );

    return keys.map((key) => {
      const uploadedProducts = uploadedByDay.get(key) ?? [];
      const deletedProducts = deletedByDay.get(key) ?? [];

      return {
        key,
        label: this.formatBucketLabel(key, granularity),
        uploadedCount: uploadedProducts.length,
        deletedCount: deletedProducts.length,
        uploadedProducts,
        deletedProducts,
      };
    });
  }

  private async buildRecentOrders(referenceTime: Date): Promise<DashboardRecentOrder[]> {
    const recentRaw = await this.orderRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    const activeRecent = recentRaw
      .filter((item) => this.isActiveAt(item.createdAt, item.deletedAt, referenceTime))
      .slice(0, 5);

    const orderIds = activeRecent.map((item) => item.id);
    const itemCounts = await this.countOrderItems(orderIds);

    return activeRecent.map((item) => ({
      id: item.id,
      status: item.status,
      totalAmount: Number(item.totalAmount ?? 0),
      itemCount: itemCounts.get(item.id) ?? 0,
      receiverName: String(item.receiverName ?? ''),
      createdAt: item.createdAt,
    }));
  }

  private buildRecentProducts(products: Product[], referenceTime: Date): DashboardRecentProduct[] {
    return products
      .filter((item) => this.isActiveAt(item.createdAt, item.deletedAt, referenceTime))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price ?? 0),
        stock: Number(item.stock ?? 0),
        thumbnail: item.thumbnail ?? null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
  }

  private async countOrderItems(orderIds: number[]): Promise<Map<number, number>> {
    if (!orderIds.length) return new Map<number, number>();

    const raw = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .select('orderItem.order_id', 'orderId')
      .addSelect('COUNT(orderItem.id)', 'itemCount')
      .where('orderItem.order_id IN (:...orderIds)', { orderIds })
      .andWhere('orderItem.deletedAt IS NULL')
      .groupBy('orderItem.order_id')
      .getRawMany<{ orderId: string; itemCount: string }>();

    const map = new Map<number, number>();
    raw.forEach((row) => {
      const key = Number(row.orderId);
      const value = Number(row.itemCount ?? 0);
      if (Number.isFinite(key)) {
        map.set(key, Number.isFinite(value) ? value : 0);
      }
    });

    return map;
  }

  private buildRangeTemplate(granularity: DashboardGranularity, rangeStart: Date, rangeEnd: Date): string[] {
    const template: string[] = [];

    if (granularity === 'year') {
      for (let month = 0; month <= rangeEnd.getMonth(); month += 1) {
        template.push(this.toMonthKey(new Date(rangeEnd.getFullYear(), month, 1)));
      }
      return template;
    }

    for (
      let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
      cursor <= rangeEnd;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
    ) {
      template.push(this.toDayKey(cursor));
    }

    return template;
  }

  private getRangeStart(granularity: DashboardGranularity, now: Date): Date {
    if (granularity === 'week') {
      return this.startOfWeekMonday(now);
    }

    if (granularity === 'month') {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return new Date(now.getFullYear(), 0, 1);
  }

  private startOfWeekMonday(value: Date): Date {
    const day = value.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate() + diff);
  }

  private startOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  private isRevenueRecognized(status: Status | string): boolean {
    return REVENUE_RECOGNIZED_STATUSES.has(String(status ?? '').toUpperCase());
  }

  private isActiveAt(createdAt: Date | null | undefined, deletedAt: Date | null | undefined, at: Date): boolean {
    const created = this.toDate(createdAt);
    if (!created) return false;
    if (created > at) return false;

    const deleted = this.toDate(deletedAt);
    if (!deleted) return true;

    return deleted > at;
  }

  private toDate(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toDayKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private toMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private formatBucketLabel(bucket: string, granularity: DashboardGranularity): string {
    if (granularity === 'year') {
      const [year, month] = bucket.split('-');
      return `${month}/${year}`;
    }

    const [_, month, day] = bucket.split('-');
    return `${day}/${month}`;
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(Number(value ?? 0));
  }

  private resolveExportReferenceTime(mode: DashboardExportMode, snapshotAt?: string): Date {
    if (mode !== 'snapshot') {
      return new Date();
    }

    const parsed = this.toDate(snapshotAt ?? null);
    if (!parsed) {
      return new Date();
    }

    const now = new Date();
    if (parsed > now) return now;
    return parsed;
  }

  private normalizeText(value: string): string {
    return String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đ]/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private toIsoString(value: Date | null | undefined): string {
    const date = this.toDate(value);
    return date ? date.toISOString() : '';
  }
}
