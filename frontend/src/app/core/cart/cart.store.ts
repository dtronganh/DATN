import { Injectable, inject, signal, computed } from '@angular/core';
import { CartApi } from '@core/api/cart.api';
import { Cart, CartItem, AddToCartPayload } from '@core/models/cart.model';
import { ToastService } from '@core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly cartApi = inject(CartApi);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  private readonly cart = signal<Cart | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly items = computed(() => this.cart()?.items ?? []);
  readonly count = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() => this.cart()?.total ?? 0);
  readonly isEmpty = computed(() => this.items().length === 0);

  loadCart(): void {
    this.loading.set(true);
    this.error.set(null);

    this.cartApi.getCart().subscribe({
      next: (response) => {
        this.cart.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.error.set(err.message || this.translate.instant('cart.toast.loadFailed'));
        this.loading.set(false);
        this.cart.set(null);
      }
    });
  }

  addToCart(productId: number, quantity: number = 1): void {
    const payload: AddToCartPayload = { productId, quantity };
    
    this.loading.set(true);
    this.error.set(null);

    this.cartApi.addItem(payload).subscribe({
      next: (response) => {
        this.cart.set(response.data);
        this.loading.set(false);
        this.toastService.success(this.translate.instant('cart.toast.added'));
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        this.error.set(err.message || this.translate.instant('cart.toast.addFailed'));
        this.loading.set(false);
        this.toastService.error(err.error?.message || this.translate.instant('cart.toast.addFailed'));
      }
    });
  }

  updateCartItem(itemId: number, quantity: number): void {
    if (quantity < 1) {
      this.toastService.warning(this.translate.instant('cart.toast.quantityMin'));
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.cartApi.updateItem(itemId, { quantity }).subscribe({
      next: (response) => {
        this.cart.set(response.data);
        this.loading.set(false);
        this.toastService.success(this.translate.instant('cart.toast.updated'));
      },
      error: (err) => {
        console.error('Error updating cart item:', err);
        this.error.set(err.message || this.translate.instant('cart.toast.updateFailed'));
        this.loading.set(false);
        this.toastService.error(err.error?.message || this.translate.instant('cart.toast.updateFailed'));
      }
    });
  }

  removeCartItem(itemId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.cartApi.removeItem(itemId).subscribe({
      next: (response) => {
        this.cart.set(response.data);
        this.loading.set(false);
        this.toastService.success(this.translate.instant('cart.toast.removed'));
      },
      error: (err) => {
        console.error('Error removing cart item:', err);
        this.error.set(err.message || this.translate.instant('cart.toast.removeFailed'));
        this.loading.set(false);
        this.toastService.error(err.error?.message || this.translate.instant('cart.toast.removeFailed'));
      }
    });
  }

  clearCart(silent: boolean = false): void {
    this.loading.set(true);
    this.error.set(null);

    this.cartApi.clearCart().subscribe({
      next: (response) => {
        this.cart.set(response.data);
        this.loading.set(false);
        if (!silent) {
          this.toastService.success(this.translate.instant('cart.toast.cleared'));
        }
      },
      error: (err) => {
        console.error('Error clearing cart:', err);
        this.error.set(err.message || this.translate.instant('cart.toast.clearFailed'));
        this.loading.set(false);
        this.toastService.error(err.error?.message || this.translate.instant('cart.toast.clearFailed'));
      }
    });
  }

  reset(): void {
    this.cart.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}
