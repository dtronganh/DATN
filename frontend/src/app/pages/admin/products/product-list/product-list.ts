import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductApi } from '@core/api/product.api';
import { CategoryApi } from '@core/api/category.api';
import { Product } from '@core/models/product.model';
import { ConfirmService } from '@core/services/confirm.service';
import { ToastService } from '@core/services/toast.service';
import { LocaleService } from '@core/services/locale.service';
import { AdminSearch } from '@shared/components/admin-search/admin-search';
import { formatDate, formatVND } from '@shared/utils';
import { Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { Button } from '@shared/components/button/button';
import { SortableTableHeaderComponent, TableColumn, SortEvent, AdminTableComponent } from '@shared/components';

@Component({
  selector: 'admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, Button, AdminSearch, SortableTableHeaderComponent, AdminTableComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListPage implements OnInit {
  private readonly productApi = inject(ProductApi);
  private readonly categoryApi = inject(CategoryApi);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);
  private readonly localeService = inject(LocaleService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly searchQuery = signal('');
  readonly sortField = signal<string>('updatedAt');
  readonly sortDirection = signal<'ASC' | 'DESC'>('DESC');
  readonly categoryMap = signal<Map<number, string>>(new Map());
  readonly tableColumns: TableColumn[] = [
    { field: 'name', label: 'admin.products.name', sortable: true },
    { field: 'price', label: 'admin.products.price', sortable: true },
    { field: 'stock', label: 'admin.products.stock', sortable: true },
    { field: 'category', label: 'admin.products.category', sortable: false },
    { field: 'createdAt', label: 'admin.orders.date', sortable: true },
    { field: 'actions', label: 'admin.products.actions', sortable: false, align: 'right', width: '1%' },
  ];

  readonly formatVND = formatVND;
  readonly formatDate = formatDate;

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      if (query.trim()) {
        this.searchProducts(query);
      } else {
        this.loadProducts();
      }
    });
  }

  loadCategories(): void {
    this.categoryApi.getAll(1000).subscribe({
      next: (res) => {
        const map = new Map<number, string>();
        res.data.data.forEach(category => {
          map.set(category.id, category.name);
        });
        this.categoryMap.set(map);
      }
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productApi.getAll({ page: this.currentPage(), limit: 10, sort: `${this.sortField()}:${this.sortDirection()}` })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
      next: (res) => {
        this.products.set(res.data.data);
        this.totalPages.set(res.data.meta.totalPages);
        this.total.set(res.data.meta.total);
      },
      error: () => {}
    });
  }

  searchProducts(query: string): void {
    this.loading.set(true);
    this.productApi.search(query)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
      next: (res) => {
        this.products.set(res.data.data);
        this.totalPages.set(res.data.meta.totalPages);
        this.total.set(res.data.meta.total);
      },
      error: () => {}
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    if (this.searchQuery().trim()) {
      this.searchProducts(this.searchQuery());
    } else {
      this.loadProducts();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSortChange(event: SortEvent): void {
    this.sortField.set(event.field);
    this.sortDirection.set(event.direction);
    this.currentPage.set(1);
    this.loadProducts();
  }

  editProduct(id: number): void {
    this.router.navigate(['/admin/products', id, 'edit']);
  }

  async deleteProduct(product: Product): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      this.localeService.t('admin.products.confirmDelete'),
      { title: this.localeService.t('admin.common.confirm') }
    );
    if (!confirmed) return;

    this.productApi.delete(product.id).subscribe({
      next: () => {
        this.toastService.success(this.localeService.t('admin.products.deleteSuccess'));
        this.loadProducts();
      },
      error: () => {
        this.toastService.error('Failed to delete product');
      }
    });
  }

  getCategoryName(categoryId: number | undefined): string {
    if (!categoryId) return '—';
    return this.categoryMap().get(categoryId) ?? '—';
  }

}
