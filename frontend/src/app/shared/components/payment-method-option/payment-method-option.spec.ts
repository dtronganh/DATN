import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentMethodOptionComponent } from './payment-method-option';
import { TranslateModule } from '@ngx-translate/core';

describe('PaymentMethodOptionComponent', () => {
  let component: PaymentMethodOptionComponent;
  let fixture: ComponentFixture<PaymentMethodOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMethodOptionComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentMethodOptionComponent);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('value', 'cod');
    fixture.componentRef.setInput('titleKey', 'title');
    fixture.componentRef.setInput('descKey', 'desc');
    fixture.componentRef.setInput('iconPath', 'icon');
    fixture.componentRef.setInput('isSelected', false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
