
import { Component, inject, OnInit, signal, afterNextRender, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import { Footer } from "@shared/components/footer/footer";
import { Button } from '@shared/components/button/button';
import { CommonModule } from '@angular/common';
import Aos from 'aos';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaymentResultCardComponent } from '@shared/components';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [
    Navbar,
    Breadcrumb,
    Footer,
    CommonModule,
    TranslateModule,
    Button,
    PaymentResultCardComponent
],
  templateUrl: './payment-failure.html',
  styleUrl: './payment-failure.css'
})
export class PaymentFailure implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  readonly orderId = signal<number | null>(null);
  readonly errorMessage = signal<string>('');
  readonly failureIconPath = 'M6 18L18 6M6 6l12 12';

  readonly paymentDetails = computed(() => [
    {
      labelKey: 'shop.payment.orderId',
      value: this.orderId() ? `#${this.orderId()}` : '',
      show: !!this.orderId()
    }
  ]);

  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId.set(parseInt(params['orderId']) || null);
      this.errorMessage.set(this.normalizeErrorMessage(params['error']));
    });
  }

  private normalizeErrorMessage(errorParam: unknown): string {
    if (typeof errorParam === 'string' && errorParam.trim().length > 0) return errorParam;
    if (errorParam && typeof errorParam === 'object') {
      const maybeMessage = (errorParam as { message?: string }).message;
      if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) return maybeMessage;
    }
    return this.translate.instant('shop.paymentFailure.defaultError');
  }

  onTryAgain(): void {
    const orderId = this.orderId();
    if (orderId) {
      this.router.navigate(['/payment-method'], { queryParams: { orderId } });
      return;
    }
    this.router.navigate(['/payment-method']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToContact(): void {
    this.router.navigate(['/contact']);
  }
}
