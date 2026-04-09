import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistPopup } from './wishlist-popup';
import { WishlistStore } from '@core/wishlist/wishlist.store';

describe('WishlistPopup', () => {
  let component: WishlistPopup;
  let fixture: ComponentFixture<WishlistPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistPopup],
      providers: [
        {
          provide: WishlistStore,
          useValue: {
            count: () => 0,
            items: () => [],
            removeFromWishlist: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistPopup);
    fixture.componentRef.setInput('categoryMap', new Map());
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
