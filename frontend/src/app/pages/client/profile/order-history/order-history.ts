import { Component, afterNextRender, signal, inject } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import { RouterLink } from '@angular/router';
import { AccountTab } from "@shared/components/account-tab/account-tab";
import { Footer } from "@shared/components/footer/footer";
import { CommonModule } from '@angular/common';
import Aos from 'aos';
import { OrderStore } from '@core/order/order.store';
import { formatVND } from '@shared/utils';
import { ConfirmService } from '@core/services/confirm.service';
import { ConfirmComponent } from '@shared/components/confirm/confirm';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from '@shared/components/button/button';

@Component({
  selector: 'app-order-history',
  imports: [
    RouterLink,
    Navbar,
    Breadcrumb,
    AccountTab,
    Footer,
    CommonModule,
    ConfirmComponent,
    TranslateModule,
    Button
],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css'
})
export class OrderHistory {
  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });

  orderStore = inject(OrderStore);
  private confirmService = inject(ConfirmService);
  private translate = inject(TranslateService);
  formatVND = formatVND;
  cancellingOrderId = signal<number | null>(null);

  ngOnInit() {
    this.orderStore.loadOrders();
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'bg-[#EC991D]',
      'PAID': 'bg-[#60A5FA]',
      'SHIPPED': 'bg-[#31A051]',
      'CANCELLED': 'bg-[#E13939]',
    };
    return statusMap[status] || 'bg-gray-500';
  }

  getStatusLabel(status: string): string {
    const statusKeyMap: Record<string, string> = {
      'PENDING': 'profile.orderHistoryPage.status.pending',
      'PAID': 'profile.orderHistoryPage.status.shipping',
      'SHIPPED': 'profile.orderHistoryPage.status.completed',
      'CANCELLED': 'profile.orderHistoryPage.status.cancelled',
    };
    const key = statusKeyMap[status];
    return key ? this.translate.instant(key) : status;
  }

  canCancelOrder(status: string): boolean {
    return status === 'PENDING';
  }

  async cancelOrder(orderId: number) {
    const confirmed = await this.confirmService.confirm(
      this.translate.instant('profile.orderHistoryPage.confirm.message'),
      {
        title: this.translate.instant('profile.orderHistoryPage.confirm.title'),
        confirmText: this.translate.instant('profile.orderHistoryPage.confirm.confirmText'),
        cancelText: this.translate.instant('profile.orderHistoryPage.confirm.cancelText')
      }
    );

    if (confirmed) {
      this.cancellingOrderId.set(orderId);
      try {
        await this.orderStore.cancelOrder(orderId);
      } finally {
        this.cancellingOrderId.set(null);
      }
    }
  }
}
