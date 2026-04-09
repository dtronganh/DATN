import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserApi } from '@core/api/user.api';
import { ProductApi } from '@core/api/product.api';
import { OrderApi } from '@core/api/order.api';
import { AuthStore } from '@core/auth/auth.store';
import { Order } from '@core/models/order.model';
import { Product } from '@core/models/product.model';
import { StatusBadgeComponent } from '@shared/components';
import { formatDate, formatVND } from '@shared/utils';

interface StatCard {
  labelKey: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  hoverBgClass: string;
  value: () => string | number;
}

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, StatusBadgeComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardPage implements OnInit {
  private readonly userApi = inject(UserApi);
  private readonly productApi = inject(ProductApi);
  private readonly orderApi = inject(OrderApi);
  readonly authStore = inject(AuthStore);

  readonly totalUsers = signal(0);
  readonly totalProducts = signal(0);
  readonly totalOrders = signal(0);
  readonly totalRevenue = signal(0);
  readonly recentOrders = signal<Order[]>([]);
  readonly recentProducts = signal<Product[]>([]);
  readonly loading = signal(true);

  readonly formatVND = formatVND;
  readonly formatDate = formatDate;

  readonly statCards = computed<StatCard[]>(() => [
    {
      labelKey: 'admin.dashboard.totalUsers',
      icon: 'lnr lnr-users',
      iconBgClass: 'bg-primary/10',
      iconColorClass: 'text-primary',
      hoverBgClass: 'group-hover:bg-primary',
      value: () => this.totalUsers()
    },
    {
      labelKey: 'admin.dashboard.totalProducts',
      icon: 'lnr lnr-tag',
      iconBgClass: 'bg-blue-500/10',
      iconColorClass: 'text-blue-500',
      hoverBgClass: 'group-hover:bg-blue-500',
      value: () => this.totalProducts()
    },
    {
      labelKey: 'admin.dashboard.totalOrders',
      icon: 'lnr lnr-cart',
      iconBgClass: 'bg-green-500/10',
      iconColorClass: 'text-green-500',
      hoverBgClass: 'group-hover:bg-green-500',
      value: () => this.totalOrders()
    },
    {
      labelKey: 'admin.dashboard.totalRevenue',
      icon: 'lnr lnr-diamond',
      iconBgClass: 'bg-yellow-500/10',
      iconColorClass: 'text-yellow-500',
      hoverBgClass: 'group-hover:bg-yellow-500',
      value: () => `${this.formatVND(this.totalRevenue())}₫`
    }
  ]);

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentData();
  }

  private loadStats(): void {
    this.userApi.getUsers({ limit: 1 }).subscribe({
      next: (res) => this.totalUsers.set(res.data.meta.total),
    });

    this.productApi.getAll({ limit: 1 }).subscribe({
      next: (res) => this.totalProducts.set(res.data.meta.total),
    });

    this.orderApi.getAll({ limit: 1 }).subscribe({
      next: (res) => {
        this.totalOrders.set(res.data.meta.total);
      },
    });

    this.orderApi.getAll({ limit: 100 }).subscribe({
      next: (res) => {
        const revenue = res.data.data
          .filter(o => o.status === 'SHIPPED') 
          .reduce((sum, o) => sum + o.totalAmount, 0);
        this.totalRevenue.set(revenue);
      },
    });
  }

  private loadRecentData(): void {
    this.orderApi.getAll({ limit: 5, sort: 'createdAt:DESC' }).subscribe({
      next: (res) => {
        this.recentOrders.set(res.data.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.productApi.getAll({ limit: 5, sort: 'updatedAt:DESC' }).subscribe({
      next: (res) => this.recentProducts.set(res.data.data),
    });
  }

}
