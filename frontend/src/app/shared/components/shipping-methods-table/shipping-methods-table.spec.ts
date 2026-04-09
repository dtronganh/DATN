import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShippingMethodsTableComponent } from './shipping-methods-table';
import { TranslateModule } from '@ngx-translate/core';

describe('ShippingMethodsTableComponent', () => {
  let component: ShippingMethodsTableComponent;
  let fixture: ComponentFixture<ShippingMethodsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingMethodsTableComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingMethodsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
