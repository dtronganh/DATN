import { Component, input, inject, output, TemplateRef, contentChild } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Product } from '@core/models/product.model';
import { WishlistStore } from '@core/wishlist/wishlist.store';
import { AuthStore } from '@core/auth/auth.store';
import { formatVND } from '@shared/utils';
import { NgTemplateOutlet } from '@angular/common';
import { ToastService } from '@core/services/toast.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { RatingComponent } from '@shared/components/rating/rating';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    RouterLink,
    NgTemplateOutlet,
    RatingComponent,
    TranslateModule
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  readonly wishlistStore = inject(WishlistStore);
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly productList = input<Product[]>([]);
  readonly classList = input<string>('');
  readonly variant = input<'default' | 'compact'>('default');
  readonly actionsTemplate = contentChild<TemplateRef<any>>('actionsTemplate');
  readonly onAddToCart = output<Product>();

  toggleWishlist(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.wishlistStore.toggleWishlist(product);
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistStore.isInWishlist(productId);
  }

  addToCart(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.authStore.isAuthenticated()) {
      this.toastService.warning(this.translate.instant('cart.loginToAdd'));
      this.router.navigate(['/auth/login']);
      return;
    }

    this.onAddToCart.emit(product);
  }

  readonly formatVND = formatVND;
}
