import { computed, Injectable, signal, inject, effect } from '@angular/core';
import { Product } from '@core/models/product.model';
import { WishlistApi } from '@core/api/wishlist.api';
import { AuthStore } from '@core/auth/auth.store';
import { ToastService } from '@core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, of, tap } from 'rxjs';

interface WishlistState {
  items: Product[];
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistStore {
  private wishlistApi = inject(WishlistApi);
  private authStore = inject(AuthStore);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);

  private state = signal<WishlistState>({
    items: [],
    loading: false
  });

  readonly items = computed(() => this.state().items);
  readonly count = computed(() => this.state().items.length);
  readonly itemIds = computed(() => this.state().items.map(item => item.id));
  readonly loading = computed(() => this.state().loading);

  constructor() {
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        this.loadWishlist();
      } else {
        this.state.update(state => ({ ...state, items: [], loading: false }));
      }
    });
  }

  private loadWishlist(): void {
    this.state.update(state => ({ ...state, loading: true }));
    
    this.wishlistApi.getWishlist().pipe(
      tap(response => {
        const items = response.data.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          thumbnail: item.product.thumbnail,
          slug: `product-${item.product.id}`,
          stock: 0,
          images: [],
          attributes: undefined,
          createdAt: '',
          updatedAt: ''
        } as Product));
        
        this.state.update(state => ({
          ...state,
          items,
          loading: false
        }));
      }),
      catchError(error => {
        console.error('Failed to load wishlist:', error);
        this.state.update(state => ({ ...state, loading: false }));
        return of(null);
      })
    ).subscribe();
  }

  isInWishlist(productId: number): boolean {
    return this.state().items.some(item => item.id === productId);
  }

  addToWishlist(product: Product): void {
    if (!this.authStore.isAuthenticated()) {
      this.toastService.warning(this.translate.instant('wishlist.toast.loginToAdd'));
      return;
    }

    if (this.isInWishlist(product.id)) {
      return;
    }

    this.wishlistApi.addItem({ productId: product.id }).pipe(
      tap(response => {
        const items = response.data.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          thumbnail: item.product.thumbnail,
          slug: `product-${item.product.id}`,
          stock: 0,
          images: [],
          attributes: undefined,
          createdAt: '',
          updatedAt: ''
        } as Product));
        
        this.state.update(state => ({
          ...state,
          items
        }));
      }),
      catchError(error => {
        console.error('Failed to add to wishlist:', error);
        return of(null);
      })
    ).subscribe();
  }

  removeFromWishlist(productId: number): void {
    if (!this.authStore.isAuthenticated()) {
      return;
    }

    const item = this.state().items.find(i => i.id === productId);
    if (!item) {
      return;
    }

    this.wishlistApi.getWishlist().pipe(
      tap(response => {
        const wishlistItem = response.data.items.find(i => i.product.id === productId);
        if (wishlistItem) {
          this.wishlistApi.removeItem(wishlistItem.id).pipe(
            tap(response => {
              const items = response.data.items.map(item => ({
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                thumbnail: item.product.thumbnail,
                slug: `product-${item.product.id}`,
                stock: 0,
                images: [],
                attributes: undefined,
                createdAt: '',
                updatedAt: ''
              } as Product));
              
              this.state.update(state => ({
                ...state,
                items
              }));
            }),
            catchError(error => {
              console.error('Failed to remove from wishlist:', error);
              return of(null);
            })
          ).subscribe();
        }
      }),
      catchError(error => {
        console.error('Failed to get wishlist:', error);
        return of(null);
      })
    ).subscribe();
  }

  toggleWishlist(product: Product): void {
    if (this.isInWishlist(product.id)) {
      this.removeFromWishlist(product.id);
    } else {
      this.addToWishlist(product);
    }
  }

  clearWishlist(): void {
    if (!this.authStore.isAuthenticated()) {
      return;
    }

    this.wishlistApi.clearWishlist().pipe(
      tap(() => {
        this.state.update(state => ({ ...state, items: [], loading: false }));
        this.toastService.success(this.translate.instant('wishlist.toast.cleared'));
      }),
      catchError(error => {
        console.error('Failed to clear wishlist:', error);
        this.toastService.error(this.translate.instant('wishlist.toast.clearFailed'));
        return of(null);
      })
    ).subscribe();
  }
}
