import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetails } from './product-details';

describe('ProductDetails', () => {
  let component: ProductDetails;
  let fixture: ComponentFixture<ProductDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetails);
    component = fixture.componentInstance;
    component.product.set({
      id: 1,
      name: 'Test Product',
      price: 100,
      stock: 1,
      description: 'Test description',
      thumbnail: '',
      images: [],
      attributes: []
    } as any);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
