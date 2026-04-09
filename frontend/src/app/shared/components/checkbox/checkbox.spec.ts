import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox';
import { TranslateModule } from '@ngx-translate/core';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit checked state on toggle', () => {
    let emittedValue: boolean | undefined;
    component.checkedChange.subscribe((value: boolean) => {
      emittedValue = value;
    });

    const label = fixture.nativeElement.querySelector('label');
    label.click();

    expect(emittedValue).toBe(true);
  });

  it('should display label', () => {
    fixture.componentRef.setInput('label', 'Remember me');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('span:last-child');
    expect(label?.textContent).toContain('Remember me');
  });

  it('should not emit when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    let emittedValue: boolean | undefined;
    component.checkedChange.subscribe((value: boolean) => {
      emittedValue = value;
    });

    const label = fixture.nativeElement.querySelector('label');
    label.click();

    expect(emittedValue).toBeUndefined();
  });
});
