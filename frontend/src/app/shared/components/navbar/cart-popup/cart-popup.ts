import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClickOutsideDirective } from 'ng-click-outside2';

import { AuthStore } from '@core/auth/auth.store';
import { CartStore } from '@core/cart/cart.store';
import { formatVND } from '@shared/utils';
import { ToastService } from '@core/services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-cart-popup',
  standalone: true,
  imports: [RouterLink, NgClickOutsideDirective, TranslateModule],
  templateUrl: './cart-popup.html',
  styleUrl: './cart-popup.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPopup {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  readonly cartStore = inject(CartStore);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);
  readonly formatVND = formatVND;

  readonly open = signal(false);

  toggleOpen(): void {
    if (!this.authStore.isAuthenticated()) {
      this.toastService.warning(this.translate.instant('cart.loginToAdd'));
      this.router.navigate(['/auth/login']);
      return;
    }
    this.open.update(v => !v);
  }

  onClickedOutside(_: Event): void {
    this.open.set(false);
  }
}
