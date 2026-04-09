import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentResultCardComponent } from './payment-result-card';
import { TranslateModule } from '@ngx-translate/core';

describe('PaymentResultCardComponent', () => {
  let component: PaymentResultCardComponent;
  let fixture: ComponentFixture<PaymentResultCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentResultCardComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentResultCardComponent);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('titleKey', 'payment.success');
    fixture.componentRef.setInput('iconPath', 'assets/img/icon/success.svg');
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
