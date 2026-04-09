import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { ProductApi } from '@core/api/product.api';
import { Product } from '@core/models/product.model';
import { formatVND } from '@shared/utils';
import { Button } from '@shared/components/button/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search-popup',
  standalone: true,
  imports: [Button, TranslateModule],
  templateUrl: './search-popup.html',
  styleUrl: './search-popup.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPopup {
  private readonly router = inject(Router);
  private readonly productApi = inject(ProductApi);
  private readonly translate = inject(TranslateService);
  private readonly searchSubject = new Subject<string>();

  readonly open = input.required<boolean>();
  readonly categoryMap = input<Map<number, string>>(new Map());
  readonly closed = output<void>();

  readonly searchQuery = signal('');
  readonly searchResults = signal<Product[]>([]);
  readonly isSearching = signal(false);
  readonly formatVND = formatVND;

  readonly popularTags = ['RAM', 'GPU', 'SSD', 'CPU', 'Motherboard'];

  constructor() {
    effect(() => {
      if (!this.open()) {
        this.resetSearch();
      }
    });

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(query => {
        this.isSearching.set(true);
        return this.productApi.search(query);
      })
    ).subscribe({
      next: (res) => {
        this.searchResults.set(res.data.data);
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search error:', err);
        this.isSearching.set(false);
      }
    });
  }

  close(): void {
    this.resetSearch();
    this.closed.emit();
  }

  onSearchInput(query: string): void {
    this.searchQuery.set(query);
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      this.searchResults.set([]);
      this.isSearching.set(false);
      return;
    }
    this.searchSubject.next(trimmed);
  }

  onTagClick(tag: string): void {
    this.searchQuery.set(tag);
    this.searchSubject.next(tag);
  }

  navigateToProduct(slug: string): void {
    this.router.navigate(['/product-details', slug]);
    this.close();
  }

  getCategoryName(categoryId: number | undefined): string {
    if (!categoryId) return this.translate.instant('nav.uncategorized');
    return this.categoryMap().get(categoryId) ?? this.translate.instant('nav.uncategorized');
  }

  private resetSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.isSearching.set(false);
  }
}
