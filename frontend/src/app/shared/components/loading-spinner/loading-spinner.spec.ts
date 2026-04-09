import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner';
import { TranslateModule } from '@ngx-translate/core';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display spinner', () => {
    const spinner = fixture.nativeElement.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should apply correct size classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    
    const spinner = fixture.nativeElement.querySelector('.animate-spin');
    expect(spinner.classList.contains('w-12')).toBeTruthy();
  });
});
