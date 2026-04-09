
import { Component, afterNextRender, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import Aos from 'aos';
import { IncDec } from "@shared/components/inc-dec/inc-dec";
import { Footer } from "@shared/components/footer/footer";
import { CartStore } from '@core/cart/cart.store';
import { formatVND } from '@shared/utils';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from "@shared/components/button/button";
import { CartSummaryComponent } from '@shared/components';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    RouterLink,
    Navbar,
    Breadcrumb,
    IncDec,
    Footer,
    TranslateModule,
    Button,
    CartSummaryComponent
],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  readonly cartStore = inject(CartStore);
  readonly formatVND = formatVND;

  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });

  ngOnInit(): void {
    this.cartStore.loadCart();
  }

  onQuantityChange(itemId: number, newQuantity: number): void {
    this.cartStore.updateCartItem(itemId, newQuantity);
  }

  removeItem(itemId: number): void {
    this.cartStore.removeCartItem(itemId);
  }
}
