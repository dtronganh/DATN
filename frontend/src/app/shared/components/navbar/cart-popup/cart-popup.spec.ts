import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CartPopup } from './cart-popup';
import { AuthStore } from '@core/auth/auth.store';
import { CartStore } from '@core/cart/cart.store';
import { ToastService } from '@core/services/toast.service';

describe('CartPopup', () => {
  let component: CartPopup;
  let fixture: ComponentFixture<CartPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartPopup],
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: { isAuthenticated: () => false }
        },
        {
          provide: CartStore,
          useValue: {
            count: () => 0,
            loading: () => false,
            isEmpty: () => true,
            items: () => [],
            total: () => 0,
            removeCartItem: vi.fn()
          }
        },
        {
          provide: ToastService,
          useValue: { warning: vi.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
