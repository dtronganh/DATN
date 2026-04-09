import { Component, afterNextRender, inject, signal, effect, computed } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { ActivatedRoute, Router } from '@angular/router';
import Aos from 'aos';
import { IncDec } from "@shared/components/inc-dec/inc-dec";
import { DetailTab } from "@shared/components/product/detail-tab/detail-tab";
import { ProductCard } from "@shared/components/product/product-card/product-card";
import { Footer } from "@shared/components/footer/footer";
import { ProductApi } from '@core/api/product.api';
import { CategoryApi } from '@core/api/category.api';
import { Product } from '@core/models/product.model';
import { Category } from '@core/models/category.model';
import { WishlistStore } from '@core/wishlist/wishlist.store';
import { CartStore } from '@core/cart/cart.store';
import { AuthStore } from '@core/auth/auth.store';
import { ToastService } from '@core/services/toast.service';
import { calculateTime as calculateCountdown, formatVND } from '@shared/utils';
import { Button } from '@shared/components/button/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SocialShareComponent } from '@shared/components';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    Navbar,
    IncDec,
    DetailTab,
    ProductCard,
    Footer,
    Button,
    TranslateModule,
    SocialShareComponent,
    Breadcrumb
],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productApi = inject(ProductApi);
  private readonly categoryApi = inject(CategoryApi);
  readonly wishlistStore = inject(WishlistStore);
  readonly cartStore = inject(CartStore);
  readonly authStore = inject(AuthStore);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });

  readonly product = signal<Product | null>(null);
  readonly categoryName = signal<string | null>(null);
  readonly quantity = signal(1);
  readonly tags = signal<string[]>([]);
  protected readonly formatVND = formatVND;
  readonly relatedProducts = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeImage = signal(0);
  
  readonly countdownDate = signal(new Date('September 13, 2025 6:0:0'));
  readonly days = signal(0);
  readonly hours = signal(0);
  readonly minutes = signal(0);
  readonly seconds = signal(0);

  readonly sku = computed(() => {
    const id = this.product()?.id;
    return id ? `SKU_${id.toString().padStart(4, '0')}` : '';
  });

  constructor() {
    this.route.params.subscribe(params => {
      const slug = params['id'];
      if (slug) {
        this.loadProduct(slug);
        this.scrollToTop();
      }
    });

    setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  private scrollToTop(): void {
    const scrollToTop = () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      
      if (currentScroll > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, currentScroll - currentScroll / 8);
      }
    };
    
    scrollToTop();
  }

  private loadProduct(slug: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.categoryName.set(null);

    this.productApi.getBySlug(slug).subscribe({
      next: (response) => {
        this.product.set(response.data);
        this.loading.set(false);
        
        this.generateTags(response.data);
        
        if (response.data.categoryId) {
          this.loadRelatedProducts(response.data.categoryId, response.data.id);
          this.loadCategoryName(response.data.categoryId);
        }
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.router.navigate(['/error'], { skipLocationChange: true });
      }
    });
  }

  private generateTags(product: Product): void {
    const tags: string[] = [];
    const nameWords = product.name.split(' ').filter(w => w.length > 3 && !w.match(/^\d+$/));
    tags.push(...nameWords);
    this.tags.set([...new Set(tags)].slice(0, 5));
  }

  private loadCategoryName(id: number): void {
    this.categoryApi.getAll(100).subscribe({
      next: (res) => {
        const foundCat = res.data.data.find((c: Category) => c.id === id);
        if (foundCat) {
          this.categoryName.set(foundCat.name);
        }
      },
      error: () => console.error('Failed to load category name')
    });
  }

  private loadRelatedProducts(categoryId: number, currentProductId: number): void {
    this.productApi.getByCategory(categoryId, { limit: 8 }).subscribe({
      next: (response) => {
        const filtered = response.data.data.filter((p: Product) => p.id !== currentProductId);
        this.relatedProducts.set(filtered);
      },
      error: (err) => {
        console.error('Error loading related products:', err);
      }
    });
  }

  toggleWishlist(): void {
    const currentProduct = this.product();
    if (currentProduct) {
      this.wishlistStore.toggleWishlist(currentProduct);
    }
  }

  addToCart(): void {
    if (!this.authStore.isAuthenticated()) {
      this.toastService.warning(this.translate.instant('cart.loginToAdd'));
      this.router.navigate(['/auth/login']);
      return;
    }

    const currentProduct = this.product();
    if (currentProduct) {
      this.cartStore.addToCart(currentProduct.id, this.quantity());
    }
  }

  onRelatedProductAddToCart(product: Product): void {
    this.cartStore.addToCart(product.id, 1);
  }

  isInWishlist(): boolean {
    const currentProduct = this.product();
    return currentProduct ? this.wishlistStore.isInWishlist(currentProduct.id) : false;
  }
  
  updateCountdown() {
    const time = calculateCountdown(this.countdownDate());
    this.days.set(time.days);
    this.hours.set(time.hours);
    this.minutes.set(time.minutes);
    this.seconds.set(time.seconds);
  }
}
