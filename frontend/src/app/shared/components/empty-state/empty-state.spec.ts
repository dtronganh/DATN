import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state';
import { TranslateModule } from '@ngx-translate/core';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', 'No items found');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display message', () => {
    const message = fixture.nativeElement.querySelector('p');
    expect(message?.textContent).toContain('No items found');
  });

  it('should display icon', () => {
    fixture.componentRef.setInput('icon', 'lnr-inbox');
    fixture.detectChanges();
    
    const icon = fixture.nativeElement.querySelector('span');
    expect(icon.classList.contains('lnr-inbox')).toBeTruthy();
  });

  it('should display action link when provided', () => {
    fixture.componentRef.setInput('actionText', 'Add New');
    fixture.componentRef.setInput('actionLink', '/add');
    fixture.detectChanges();
    
    const link = fixture.nativeElement.querySelector('a');
    expect(link).toBeTruthy();
  });
});
