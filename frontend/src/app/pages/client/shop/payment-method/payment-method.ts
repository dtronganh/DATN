
import { Component, afterNextRender, inject, OnInit, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import Aos from 'aos';
import { Footer } from "@shared/components/footer/footer";
import { PaymentApi } from '@core/api/payment.api';
import { PaymentMethod as PaymentMethodType } from '@core/models/payment.model';
import { ToastService } from '@core/services/toast.service';
import { CartStore } from '@core/cart/cart.store';
import { OrderStore } from '@core/order/order.store';
import { formatVND } from '@shared/utils';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from "@shared/components/button/button";
import { PaymentMethodOptionComponent } from '@shared/components';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [
    Navbar,
    Breadcrumb,
    Footer,
    CommonModule,
    TranslateModule,
    Button,
    PaymentMethodOptionComponent
],
  templateUrl: './payment-method.html',
  styleUrl: './payment-method.css'
})
export class PaymentMethod implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly paymentApi = inject(PaymentApi);
  private readonly toastService = inject(ToastService);
  private readonly cartStore = inject(CartStore);
  private readonly orderStore = inject(OrderStore);
  private readonly translate = inject(TranslateService);

  readonly orderId = signal<number | null>(null);
  readonly orderAmount = signal<number>(0);
  readonly selectedMethod = signal<PaymentMethodType>('COD');
  readonly processing = signal(false);
  readonly formatVND = formatVND;

  readonly paymentMethods = computed(() => [
    {
      value: 'COD' as const,
      titleKey: 'shop.payment.cod.title',
      descKey: 'shop.payment.cod.desc',
      iconPath: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      value: 'CARD' as const,
      titleKey: 'shop.payment.card.title',
      descKey: 'shop.payment.card.desc',
      iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
    },
    {
      value: 'BANK_TRANSFER' as const,
      titleKey: 'shop.payment.bank.title',
      descKey: 'shop.payment.bank.desc',
      iconPath: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z'
    }
  ]);

  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const amount = params['amount'];
      
      if (!amount) {
        this.toastService.error(this.translate.instant('shop.payment.invalidRequest'));
        this.router.navigate(['/cart']);
        return;
      }

      this.orderAmount.set(parseFloat(amount));
    });
  }

  selectMethod(method: PaymentMethodType): void {
    this.selectedMethod.set(method);
  }

  async processPayment(): Promise<void> {
    this.processing.set(true);

    try {
      if (!this.orderId()) {
        const pendingOrder = this.orderStore.getPendingOrder();

        if (!pendingOrder) {
          this.toastService.error(this.translate.instant('shop.payment.invalidOrder'));
          this.processing.set(false);
          return;
        }

        const order = await this.orderStore.createOrder(pendingOrder);
        this.orderId.set(order.id);
        this.orderAmount.set(order.totalAmount);
        this.orderStore.clearPendingOrder();
      }
    } catch (err) {
      console.error('Error creating order:', err);
      this.processing.set(false);
      return;
    }

    this.paymentApi.create({
      orderId: this.orderId()!,
      method: this.selectedMethod(),
      amount: this.orderAmount()
    }).subscribe({
      next: (response) => {
        this.toastService.success(this.translate.instant('order.toast.created'));
        this.cartStore.clearCart(true);
        
        this.router.navigate(['/payment-success'], {
          queryParams: {
            orderId: this.orderId(),
            paymentId: response.data.id,
            amount: this.orderAmount(),
            method: this.selectedMethod()
          }
        });
      },
      error: (err) => {
        console.error('Payment error:', err);
        this.processing.set(false);
        this.router.navigate(['/payment-failure'], {
          queryParams: {
            orderId: this.orderId(),
            error: err.error?.message || this.translate.instant('shop.payment.failed')
          }
        });
      }
    });
  }
}
