
import { Component, inject, OnInit, signal, afterNextRender, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import { Footer } from "@shared/components/footer/footer";
import { formatVND } from '@shared/utils';
import { CommonModule } from '@angular/common';
import Aos from 'aos';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from "@shared/components/button/button";
import { PaymentResultCardComponent } from '@shared/components';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [
    RouterLink,
    Navbar,
    Breadcrumb,
    Footer,
    CommonModule,
    TranslateModule,
    Button,
    PaymentResultCardComponent
],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.css'
})
export class PaymentSuccess implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  readonly orderId = signal<number | null>(null);
  readonly paymentId = signal<number | null>(null);
  readonly amount = signal<number>(0);
  readonly method = signal<string>('COD');
  readonly formatVND = formatVND;
  readonly successIconPath = 'M5 13l4 4L19 7';

  readonly paymentDetails = computed(() => [
    {
      labelKey: 'shop.payment.orderId',
      value: this.orderId() ? `#${this.orderId()}` : '',
      show: !!this.orderId()
    },
    {
      labelKey: 'shop.paymentSuccess.paymentId',
      value: this.paymentId() ? `#${this.paymentId()}` : '',
      show: !!this.paymentId()
    },
    {
      labelKey: 'shop.paymentSuccess.amountPaid',
      value: this.amount() > 0 ? `${formatVND(this.amount())}đ` : '',
      valueClass: 'text-xl font-bold text-primary',
      show: this.amount() > 0
    },
    {
      labelKey: 'shop.paymentSuccess.method',
      value: this.method() ? this.getMethodName(this.method()) : '',
      show: !!this.method()
    }
  ]);

  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId.set(parseInt(params['orderId']) || null);
      this.paymentId.set(parseInt(params['paymentId']) || null);
      this.amount.set(parseFloat(params['amount']) || 0);
      this.method.set(params['method'] || 'COD');
    });
  }

  getMethodName(method: string): string {
    const methodNames: Record<string, string> = {
      'COD': this.translate.instant('shop.payment.cod.title'),
      'CARD': this.translate.instant('shop.payment.card.title'),
      'BANK_TRANSFER': this.translate.instant('shop.payment.bank.title')
    };
    return methodNames[method] || method;
  }
}
