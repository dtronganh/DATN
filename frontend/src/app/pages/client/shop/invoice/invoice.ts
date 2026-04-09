
import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Switcher } from "@shared/components/switcher/switcher";
import { Order, OrderPreview } from '@core/models/order.model';
import { OrderApi } from '@core/api/order.api';
import { formatVND } from '@shared/utils';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-invoice',
  imports: [
    RouterLink,
    Switcher,
    CommonModule,
    TranslateModule
],
  templateUrl: './invoice.html',
  styleUrl: './invoice.css'
})
export class Invoice implements OnInit {
  private orderApi = inject(OrderApi);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  order = signal<Order | null>(null);
  loading = signal(true);
  formatVND = formatVND;

  ngOnInit() {
    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    if (orderId) {
      this.loadOrder(Number(orderId));
    }
  }

  loadOrder(orderId: number) {
    this.loading.set(true);
    this.orderApi.getById(orderId).subscribe({
      next: (response) => {
        this.order.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load order:', error);
        this.loading.set(false);
      }
    });
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': this.translate.instant('order.status.pending'),
      'PAID': this.translate.instant('order.status.paid'),
      'SHIPPED': this.translate.instant('order.status.shipped'),
      'CANCELLED': this.translate.instant('order.status.cancelled'),
      'COMPLETED': this.translate.instant('order.status.completed')
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  printInvoice() {
    window.print();
  }

  numberToWords(amount: number): string {
    const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm',
                   'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];
    const tens  = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi',
                   'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];

    const threeDigits = (n: number): string => {
      if (n === 0) return '';
      const h = Math.floor(n / 100);
      const r = n % 100;
      const t = Math.floor(r / 10);
      const u = r % 10;
      let s = h > 0 ? units[h] + ' trăm' : '';
      if (r === 0) return s;
      if (h > 0) s += ' ';
      if (t === 0 && h > 0) s += 'lẻ ' + units[u];
      else if (t === 1) s += teens[u];
      else s += tens[t] + (u > 0 ? ' ' + (u === 5 && t > 1 ? 'lăm' : units[u]) : '');
      return s.trim();
    };

    if (!amount || isNaN(amount)) return 'không';
    const n = Math.round(amount);
    if (n === 0) return 'không';

    const billion  = Math.floor(n / 1_000_000_000);
    const million  = Math.floor((n % 1_000_000_000) / 1_000_000);
    const thousand = Math.floor((n % 1_000_000) / 1_000);
    const remain   = n % 1_000;

    const parts: string[] = [];
    if (billion)  parts.push(threeDigits(billion)  + ' tỷ');
    if (million)  parts.push(threeDigits(million)  + ' triệu');
    if (thousand) parts.push(threeDigits(thousand) + ' nghìn');
    if (remain)   parts.push(threeDigits(remain));

    const result = parts.join(' ').trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
}
