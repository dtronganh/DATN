import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CartItem } from '@core/models/cart.model';
import { formatVND } from '@shared/utils';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './cart-summary.html',
  styleUrl: './cart-summary.css'
})
export class CartSummaryComponent {
  items = input<CartItem[]>([]);
  total = input<number>(0);
  shippingCost = input<number>(0);
  showCheckoutBtn = input<boolean>(true);
  checkoutDisabled = input<boolean>(false);
  checkoutBtnText = input<string>('shop.cart.checkout');
  
  readonly formatVND = formatVND;

  readonly finalTotal = computed(() => this.total() + this.shippingCost());
}
