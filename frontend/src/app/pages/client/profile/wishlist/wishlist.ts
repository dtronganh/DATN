
import { Component, afterNextRender, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import { AccountTab } from "@shared/components/account-tab/account-tab";
import Aos from 'aos';
import { Footer } from "@shared/components/footer/footer";
import { WishlistStore } from '@core/wishlist/wishlist.store';
import { CartStore } from '@core/cart/cart.store';
import { formatVND } from '@shared/utils';
import { ProductCard } from '@shared/components/product/product-card/product-card';
import { ConfirmService } from '@core/services/confirm.service';
import { Product } from '@core/models/product.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-wishlist',
  imports: [
    RouterLink,
    Navbar,
    Breadcrumb,
    AccountTab,
    Footer,
    ProductCard,
    TranslateModule
  ],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class Wishlist {
  readonly wishlistStore = inject(WishlistStore);
  readonly cartStore = inject(CartStore);
  private readonly confirmService = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  
  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });

  removeFromWishlist(productId: number): void {
    this.wishlistStore.removeFromWishlist(productId);
  }

  async clearWishlist(): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      this.translate.instant('profile.wishlistPage.clearConfirm.message'),
      {
        title: this.translate.instant('profile.wishlistPage.clearConfirm.title'),
        confirmText: this.translate.instant('profile.wishlistPage.clearConfirm.confirmText'),
        cancelText: this.translate.instant('profile.wishlistPage.clearConfirm.cancelText')
      }
    );

    if (confirmed) {
      this.wishlistStore.clearWishlist();
    }
  }

  onAddToCart(product: Product): void {
    this.cartStore.addToCart(product.id, 1);
  }

  readonly formatVND = formatVND;
}
