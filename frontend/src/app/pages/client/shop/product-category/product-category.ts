
import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import { ProductCard } from "@shared/components/product/product-card/product-card";
import { Pagination } from "@shared/components/pagination/pagination";
import Aos from 'aos';
import { Footer } from "@shared/components/footer/footer";
import { ProductApi } from '@core/api/product.api';
import { CategoryApi } from '@core/api/category.api';
import { Product } from '@core/models/product.model';
import { Category } from '@core/models/category.model';
import { CartStore } from '@core/cart/cart.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-product-category',
  imports: [Navbar, ProductCard, Pagination, Footer, TranslateModule],
  templateUrl: './product-category.html',
  styleUrl: './product-category.css'
})
export class ProductCategory implements OnInit {
  private readonly productApi = inject(ProductApi);
  private readonly categoryApi = inject(CategoryApi);
  private readonly route = inject(ActivatedRoute);
  readonly cartStore = inject(CartStore);

  readonly productList = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly categoryId = signal<number | null>(null);
  readonly category = signal<Category | null>(null);
  readonly currentPage = signal(1);
  readonly limit = signal(20);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly priceMin = signal<number | null>(null);
  readonly priceMax = signal<number | null>(null);

  readonly sortOption = signal<string>('updatedAt:DESC');
  readonly sortOptions = signal([
    { labelKey: 'shop.sort.dateNewest', value: 'updatedAt:DESC' },
    { labelKey: 'shop.sort.dateOldest', value: 'updatedAt:ASC' },
    { labelKey: 'shop.sort.priceLowHigh', value: 'price:ASC' },
    { labelKey: 'shop.sort.priceHighLow', value: 'price:DESC' },
    { labelKey: 'shop.sort.nameAToZ', value: 'name:ASC' }
  ]);
  readonly selectedSortLabelKey = computed(() => {
    const opt = this.sortOptions().find(o => o.value === this.sortOption());
    return opt?.labelKey || 'shop.sort.dateNewest';
  });
  readonly currentTitle = computed(() => this.category()?.name || 'shop.title');
  readonly filteredProducts = computed(() => {
    const min = this.priceMin();
    const max = this.priceMax();

    return this.productList().filter(product => {
      if (min !== null && product.price < min) return false;
      if (max !== null && product.price > max) return false;
      return true;
    });
  });
  readonly hasActivePriceRange = computed(() => this.priceMin() !== null || this.priceMax() !== null);
  readonly pageStart = computed(() => {
    if (!this.filteredProducts().length) return 0;
    return (this.currentPage() - 1) * this.limit() + 1;
  });
  readonly pageEnd = computed(() => {
    if (!this.filteredProducts().length) return 0;
    return this.pageStart() + this.filteredProducts().length - 1;
  });

  ngOnInit(): void {
    Aos.init();
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.currentPage.set(1);
      if (id) {
        this.categoryId.set(parseInt(id));
        this.loadCategory();
      } else {
        this.categoryId.set(null);
        this.category.set(null);
      }
      this.loadProducts();
    });
  }

  private loadCategory(): void {
    const catId = this.categoryId();
    if (!catId) return;
    this.categoryApi.getAll().subscribe({
      next: (response) => {
        const found = response.data.data.find(c => c.id === catId);
        if (found) this.category.set(found);
      },
      error: (err) => console.error('Error loading category:', err)
    });
  }

  loadProducts(): void {
    const catId = this.categoryId();
    this.loading.set(true);
    const params = { page: this.currentPage(), limit: this.limit(), sort: this.sortOption() };
    const call = catId
      ? this.productApi.getByCategory(catId, params)
      : this.productApi.getAll(params);
    call.subscribe({
      next: (response) => {
        this.productList.set(response.data.data);
        if (response.data.meta) {
          this.totalPages.set(response.data.meta.totalPages || 1);
          this.totalItems.set(response.data.meta.total || response.data.data.length || 0);
        } else {
          this.totalPages.set(1);
          this.totalItems.set(response.data.data.length || 0);
        }
        this.loading.set(false);
      },
      error: (err) => { console.error('Error:', err); this.loading.set(false); }
    });
  }

  handleSortSelect(value: string): void {
    if (this.sortOption() === value) return;
    this.sortOption.set(value);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onPriceInput(type: 'min' | 'max', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const parsed = value === '' ? null : Number(value);
    const safeValue = parsed !== null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;

    if (type === 'min') {
      this.priceMin.set(safeValue);
      return;
    }

    this.priceMax.set(safeValue);
  }

  clearPriceRange(): void {
    this.priceMin.set(null);
    this.priceMax.set(null);
  }

  onAddToCart(product: Product): void { this.cartStore.addToCart(product.id, 1); }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.loadProducts();
    }
  }
}
