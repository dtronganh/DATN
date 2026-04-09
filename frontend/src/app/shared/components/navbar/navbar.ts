import { Component, afterNextRender, inject, signal, input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NavMenu } from "./nav-menu/nav-menu";
import { WishlistStore } from '@core/wishlist/wishlist.store';
import { CartStore } from '@core/cart/cart.store';
import { CategoryApi } from '@core/api/category.api';
import { Category } from '@core/models/category.model';
import { AuthStore } from '@core/auth/auth.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    NavMenu,
    TranslateModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  host: {
    '(window:scroll)': 'onScroll()'
  }
})
export class Navbar implements OnInit {
  private readonly location = inject(Location);
  private readonly categoryApi = inject(CategoryApi);
  readonly wishlistStore = inject(WishlistStore);
  readonly cartStore = inject(CartStore);
  readonly authStore = inject(AuthStore);
  
  readonly sticky = input<boolean>(true);
  readonly currentPath = signal('');
  readonly toggle = signal(false);
  readonly scroll = signal(false);
  readonly isIndexPage = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly loadingCategories = signal(false);
  readonly categoryOpen = signal(false);

  constructor() {}

  private loadCategories(): void {
    this.loadingCategories.set(true);
    this.categoryApi.getAll().subscribe({
      next: (response) => {
        this.categories.set(response.data.data);
        this.loadingCategories.set(false);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loadingCategories.set(false);
      }
    });
  }

  onChildValueChange(newValue: boolean) {
    this.toggle.set(newValue);
    if (!newValue) {
      this.categoryOpen.set(false);
    }
  }

  toggleCategory(event: Event) {
    if (window.innerWidth <= 1024) {
      event.preventDefault();
      this.categoryOpen.set(!this.categoryOpen());
    }
  }

  private readonly afterRender = afterNextRender(() => {
    window.scrollTo(0, 0);
  });

  ngOnInit(): void {
    this.loadCategories();
    window.scrollTo(0, 0);
    const path = this.location.path();
    this.currentPath.set(path);
    this.isIndexPage.set(path === '' || path === '/');
    if (this.authStore.isAuthenticated()) {
      this.cartStore.loadCart();
    }
  }

  onScroll() {
    if (this.sticky()) {
      this.scroll.set(window.scrollY > 50);
    }
  }
}
