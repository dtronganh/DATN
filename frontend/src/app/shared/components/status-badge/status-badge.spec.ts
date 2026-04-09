import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge';
import { TranslateModule } from '@ngx-translate/core';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('status', 'PENDING');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct color for status', () => {
    fixture.componentRef.setInput('status', 'COMPLETED');
    fixture.detectChanges();
    
    expect(component.getStatusColor()).toBe('bg-[#31A051]');
  });

  it('should apply requested layout classes', () => {
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.classList.contains('py-[7px]')).toBeTruthy();
    expect(badge.classList.contains('px-[10px]')).toBeTruthy();
    expect(badge.classList.contains('font-semibold')).toBeTruthy();
  });
});
