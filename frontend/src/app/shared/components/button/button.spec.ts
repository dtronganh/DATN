import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button]
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.text()).toBe('');
    expect(component.disabled()).toBe(false);
    expect(component.color()).toBe('btn-secondary-solid');
    expect(component.padding()).toBe('mt-4 md:mt-6');
    expect(component.size()).toBe('');
  });

  it('should emit clicked event when onClick is called and not disabled', () => {
    let clickedEmitted = false;
    component.clicked.subscribe(() => {
      clickedEmitted = true;
    });

    component.onClick();

    expect(clickedEmitted).toBe(true);
  });

  it('should not emit clicked event when disabled', () => {
    let clickedEmitted = false;
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    component.clicked.subscribe(() => {
      clickedEmitted = true;
    });

    component.onClick();

    expect(clickedEmitted).toBe(false);
  });

  it('should accept custom text input', () => {
    fixture.componentRef.setInput('text', 'Click Me');
    fixture.detectChanges();

    expect(component.text()).toBe('Click Me');
  });

  it('should accept custom color input', () => {
    fixture.componentRef.setInput('color', 'btn-solid');
    fixture.detectChanges();

    expect(component.color()).toBe('btn-solid');
  });

  it('should accept routerLink input', () => {
    fixture.componentRef.setInput('routerLink', '/test-route');
    fixture.detectChanges();

    expect(component.routerLink()).toBe('/test-route');
  });
});
