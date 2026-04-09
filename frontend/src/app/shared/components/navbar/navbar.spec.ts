import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Navbar } from './navbar';
import { CategoryApi } from '@core/api/category.api';
import { AuthStore } from '@core/auth/auth.store';
import { CartStore } from '@core/cart/cart.store';
import { WishlistStore } from '@core/wishlist/wishlist.store';
import { ToastService } from '@core/services/toast.service';
import { ProductApi } from '@core/api/product.api';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        {
          provide: CategoryApi,
          useValue: {
            getAll: () => of({ data: { data: [] } })
          }
        },
        {
          provide: AuthStore,
          useValue: { isAuthenticated: () => false }
        },
        {
          provide: CartStore,
          useValue: {
            loadCart: vi.fn(),
            count: () => 0,
            loading: () => false,
            isEmpty: () => true,
            items: () => [],
            total: () => 0,
            removeCartItem: vi.fn()
          }
        },
        {
          provide: WishlistStore,
          useValue: {
            count: () => 0,
            items: () => [],
            removeFromWishlist: vi.fn()
          }
        },
        {
          provide: ToastService,
          useValue: {
            warning: vi.fn(),
            success: vi.fn(),
            error: vi.fn(),
            info: vi.fn()
          }
        },
        {
          provide: ProductApi,
          useValue: {
            search: () => of({ data: { data: [] } })
          }
        },
        {
          provide: Location,
          useValue: { path: () => '/' }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
