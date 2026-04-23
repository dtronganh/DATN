import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { AdminDashboardApi } from '@core/api/admin-dashboard.api';
import { AuthStore } from '@core/auth/auth.store';
import { Order } from '@core/models/order.model';
import { Product } from '@core/models/product.model';
import {
  DashboardChartPoint,
  DashboardGranularity,
  DashboardMetric,
} from '@core/models/admin-dashboard.model';
import { StatusBadgeComponent } from '@shared/components';
import { formatDate, formatVND } from '@shared/utils';

interface StatCard {
  metric: DashboardMetric;
  labelKey: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  hoverBgClass: string;
  value: () => string | number;
}

interface ActiveChartPoint extends DashboardChartPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, StatusBadgeComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardPage implements OnInit {
  private readonly adminDashboardApi = inject(AdminDashboardApi);
  private readonly translateService = inject(TranslateService);
  readonly authStore = inject(AuthStore);

  readonly totalUsers = signal(0);
  readonly totalProducts = signal(0);
  readonly totalOrders = signal(0);
  readonly totalRevenue = signal(0);
  readonly recentOrders = signal<Order[]>([]);
  readonly recentProducts = signal<Product[]>([]);
  readonly chartPoints = signal<DashboardChartPoint[]>([]);
  readonly totalInRange = signal(0);
  readonly growthPercent = signal(0);
  readonly peakValue = signal(0);
  readonly generatedAt = signal('');

  readonly selectedMetric = signal<DashboardMetric>('users');
  readonly granularity = signal<DashboardGranularity>('week');
  readonly exportGranularity = signal<DashboardGranularity>('month');

  readonly aiQuestion = signal('');
  readonly aiAnswer = signal('');
  readonly askingAi = signal(false);
  readonly exporting = signal(false);
  readonly activePoint = signal<ActiveChartPoint | null>(null);

  readonly loading = signal(true);

  readonly formatVND = formatVND;
  readonly formatDate = formatDate;

  readonly statCards = computed<StatCard[]>(() => [
    {
      metric: 'users',
      labelKey: 'admin.dashboard.totalUsers',
      icon: 'lnr lnr-user',
      iconBgClass: 'bg-primary/10',
      iconColorClass: 'text-primary',
      hoverBgClass: 'group-hover:bg-primary',
      value: () => this.totalUsers()
    },
    {
      metric: 'products',
      labelKey: 'admin.dashboard.totalProducts',
      icon: 'lnr lnr-layers',
      iconBgClass: 'bg-blue-500/10',
      iconColorClass: 'text-blue-500',
      hoverBgClass: 'group-hover:bg-blue-500',
      value: () => this.totalProducts()
    },
    {
      metric: 'orders',
      labelKey: 'admin.dashboard.totalOrders',
      icon: 'lnr lnr-clock',
      iconBgClass: 'bg-green-500/10',
      iconColorClass: 'text-green-500',
      hoverBgClass: 'group-hover:bg-green-500',
      value: () => this.totalOrders()
    },
    {
      metric: 'revenue',
      labelKey: 'admin.dashboard.totalRevenue',
      icon: 'lnr lnr-rocket',
      iconBgClass: 'bg-yellow-500/10',
      iconColorClass: 'text-yellow-500',
      hoverBgClass: 'group-hover:bg-yellow-500',
      value: () => `${this.formatVND(this.totalRevenue())}₫`
    }
  ]);

  readonly chartPath = computed(() => this.buildPath(this.chartPoints().map((point) => point.value), 720, 280));

  ngOnInit(): void {
    this.loadOverview();
  }

  selectMetric(metric: DashboardMetric): void {
    if (this.selectedMetric() === metric) return;
    this.selectedMetric.set(metric);
    this.activePoint.set(null);
    this.loadOverview();
  }

  setGranularity(granularity: DashboardGranularity): void {
    if (this.granularity() === granularity) return;
    this.granularity.set(granularity);
    this.activePoint.set(null);
    this.loadOverview();
  }

  onExportGranularityChange(value: string): void {
    if (value === 'week' || value === 'month' || value === 'year') {
      this.exportGranularity.set(value);
    }
  }

  onAiQuestionInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.aiQuestion.set(target.value);
  }

  selectPoint(point: DashboardChartPoint, index: number): void {
    const x = this.pointX(index);
    const y = this.pointY(point.value);

    this.activePoint.set({ ...point, x, y });
  }

  pointX(index: number): number {
    const padding = 28;
    const points = this.chartPoints();
    const xStep = points.length > 1 ? (720 - padding * 2) / (points.length - 1) : 0;
    return padding + index * xStep;
  }

  pointY(value: number): number {
    const points = this.chartPoints();
    const values = points.map((entry) => entry.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const yRange = Math.max(max - min, 1);
    const padding = 28;
    return 280 - padding - ((value - min) / yRange) * (280 - padding * 2);
  }

  shouldShowTimeTick(index: number): boolean {
    const total = this.chartPoints().length;
    if (total <= 1) return true;

    const step = Math.max(1, Math.ceil(total / 6));
    return index % step === 0 || index === total - 1;
  }

  askStatisticsAi(): void {
    if (this.askingAi()) return;

    if (!this.authStore.isAdmin()) {
      this.aiAnswer.set(this.translateService.instant('admin.dashboard.aiNoPermission'));
      return;
    }

    const question = this.aiQuestion().trim();
    if (!question) {
      this.aiAnswer.set(this.translateService.instant('admin.dashboard.aiEmptyQuestion'));
      return;
    }

    this.askingAi.set(true);
    this.adminDashboardApi.askStatsAi({
      question,
      metric: this.selectedMetric(),
      granularity: this.granularity(),
      mode: 'snapshot',
      snapshotAt: this.generatedAt() || undefined,
      locale: this.translateService.currentLang || 'vi',
    }).subscribe({
      next: (res) => {
        this.aiAnswer.set(String(res?.data?.answer ?? ''));
      },
      error: () => {
        this.aiAnswer.set(this.translateService.instant('admin.dashboard.aiFallback'));
      },
      complete: () => this.askingAi.set(false),
    });
  }

  exportStatisticsExcel(): void {
    if (this.exporting()) return;
    this.exporting.set(true);

    this.adminDashboardApi.exportExcel({
      metric: this.selectedMetric(),
      granularity: this.exportGranularity(),
      mode: 'snapshot',
      snapshotAt: this.generatedAt() || undefined,
    }).subscribe({
      next: (res) => {
        const today = new Date();
        const fileName = `dashboard-stats-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`;
        const url = window.URL.createObjectURL(res);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      complete: () => this.exporting.set(false),
      error: () => this.exporting.set(false),
    });
  }

  metricLabelKey(metric: DashboardMetric): string {
    if (metric === 'users') return 'admin.dashboard.totalUsers';
    if (metric === 'products') return 'admin.dashboard.totalProducts';
    if (metric === 'orders') return 'admin.dashboard.totalOrders';
    return 'admin.dashboard.totalRevenue';
  }

  pointDetail(point: DashboardChartPoint): string {
    if (this.selectedMetric() === 'products') {
      return this.translateService.instant('admin.dashboard.tooltip.products', {
        label: point.label,
        value: point.value,
      });
    }

    if (this.selectedMetric() === 'users') {
      return this.translateService.instant('admin.dashboard.tooltip.users', {
        label: point.label,
        value: point.value,
      });
    }

    if (this.selectedMetric() === 'orders') {
      return this.translateService.instant('admin.dashboard.tooltip.orders', {
        label: point.label,
        value: point.value,
      });
    }

    return this.translateService.instant('admin.dashboard.tooltip.revenue', {
      label: point.label,
      value: this.formatVND(point.value),
    });
  }

  pointDeleteDetail(point: DashboardChartPoint): string {
    const deleted = Number(point.deletedCount ?? 0);
    if (this.selectedMetric() !== 'products' || deleted <= 0) return '';
    return this.translateService.instant('admin.dashboard.tooltip.deletedProducts', {
      label: point.label,
      deleted,
    });
  }

  private loadOverview(): void {
    this.loading.set(true);

    this.adminDashboardApi.getOverview(this.selectedMetric(), this.granularity()).subscribe({
      next: (res) => {
        const data = res.data;
        this.totalUsers.set(Number(data?.stats?.users ?? 0));
        this.totalProducts.set(Number(data?.stats?.products ?? 0));
        this.totalOrders.set(Number(data?.stats?.orders ?? 0));
        this.totalRevenue.set(Number(data?.stats?.revenue ?? 0));

        this.chartPoints.set(data?.chart?.points ?? []);
        this.totalInRange.set(Number(data?.chart?.totalInRange ?? 0));
        this.growthPercent.set(Number(data?.chart?.growthPercent ?? 0));
        this.peakValue.set(Number(data?.chart?.peakValue ?? 0));
        this.generatedAt.set(String(data?.generatedAt ?? ''));

        this.recentOrders.set((data?.recentOrders ?? []) as Order[]);
        this.recentProducts.set((data?.recentProducts ?? []) as Product[]);
      },
      error: () => {
        this.chartPoints.set([]);
      },
      complete: () => this.loading.set(false),
    });
  }

  private buildPath(values: number[], width: number, height: number, padding = 28): string {
    if (values.length === 0) return '';

    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const yRange = Math.max(max - min, 1);
    const xStep = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

    return values
      .map((value, index) => {
        const x = padding + index * xStep;
        const y = height - padding - ((value - min) / yRange) * (height - padding * 2);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }
}
