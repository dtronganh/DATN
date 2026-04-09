import { Component, input, output, signal, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Switcher } from "@shared/components/switcher/switcher";
import { AuthStore } from '@core/auth/auth.store';
import { CategoryApi } from '@core/api/category.api';
import { Category } from '@core/models/category.model';
import { SearchPopup } from '@shared/components/search/search-popup/search-popup';
import { WishlistPopup } from '@shared/components/navbar/wishlist-popup/wishlist-popup';
import { CartPopup } from '@shared/components/navbar/cart-popup/cart-popup';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [
    RouterLink,
    Switcher,
    SearchPopup,
    WishlistPopup,
    CartPopup,
    TranslateModule
  ],
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.css'
})
export class NavMenu implements OnInit {
  private readonly categoryApi = inject(CategoryApi);
  readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);

  readonly toggle = input.required<boolean>();
  readonly categories = input<Category[]>([]);
  readonly childValueChange = output<boolean>();

  readonly search = signal(false);

  toggleValue() {
    this.childValueChange.emit(!this.toggle());
  }


  toggleSearch() {
    this.search.update(v => !v);
  }

  
  private readonly loadedCategories = signal<Category[]>([]);
  
  readonly categoryMap = computed(() => {
    const map = new Map<number, string>();
    this.loadedCategories().forEach(c => map.set(c.id, c.name));
    this.categories().forEach(c => map.set(c.id, c.name));
    return map;
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories() {
    this.categoryApi.getAll(100).subscribe({
      next: (res) => this.loadedCategories.set(res.data.data),
      error: (err) => console.error('Error loading categories in NavMenu', err)
    });
  }

  getCategoryName(categoryId: number | undefined): string {
    if (!categoryId) return this.translate.instant('nav.uncategorized');
    return this.categoryMap().get(categoryId) ?? this.translate.instant('nav.uncategorized');
  }

  closeSearch(): void {
    this.search.set(false);
  }
}
