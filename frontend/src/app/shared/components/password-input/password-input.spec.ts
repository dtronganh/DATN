import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { PasswordInputComponent } from './password-input';
import { TranslateModule } from '@ngx-translate/core';

describe('PasswordInputComponent', () => {
  let component: PasswordInputComponent;
  let fixture: ComponentFixture<PasswordInputComponent>;
  let control: FormControl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordInputComponent, TranslateModule.forRoot()]
    }).compileComponents();

    control = new FormControl('', Validators.required);
    fixture = TestBed.createComponent(PasswordInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword()).toBe(false);
    
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    
    expect(component.showPassword()).toBe(true);
    
    const input = fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('text');
  });

  it('should display error message when provided', () => {
    fixture.componentRef.setInput('errorMessage', 'Password is required');
    fixture.detectChanges();
    
    const error = fixture.nativeElement.querySelector('.text-red-500');
    expect(error?.textContent).toContain('Password is required');
  });
});
