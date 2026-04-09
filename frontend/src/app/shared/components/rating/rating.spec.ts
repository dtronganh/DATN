import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingComponent } from './rating';

describe('RatingComponent', () => {
  let component: RatingComponent;
  let fixture: ComponentFixture<RatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct number of stars', () => {
    fixture.componentRef.setInput('maxStars', 5);
    fixture.detectChanges();
    
    const stars = fixture.nativeElement.querySelectorAll('i');
    expect(stars.length).toBe(5);
  });

  it('should display filled stars based on rating', () => {
    fixture.componentRef.setInput('rating', 3);
    fixture.componentRef.setInput('maxStars', 5);
    fixture.detectChanges();
    
    const stars = fixture.nativeElement.querySelectorAll('i');
    expect(stars[0].classList.contains('text-[#EE9818]')).toBeTruthy();
    expect(stars[2].classList.contains('text-[#EE9818]')).toBeTruthy();
    expect(stars[3].classList.contains('text-slate-300')).toBeTruthy();
  });

  it('should show stock when showStock is true', () => {
    fixture.componentRef.setInput('showStock', true);
    fixture.componentRef.setInput('stock', 10);
    fixture.detectChanges();
    
    const stockElement = fixture.nativeElement.querySelector('div:last-child');
    expect(stockElement?.textContent).toContain('Stock: 10');
  });

  it('should emit rating change when not readonly', () => {
    fixture.componentRef.setInput('readonly', false);
    fixture.detectChanges();
    
    let emittedRating: number | undefined;
    component.ratingChange.subscribe((rating: number) => {
      emittedRating = rating;
    });
    
    const stars = fixture.nativeElement.querySelectorAll('i');
    stars[2].click();
    
    expect(emittedRating).toBe(3);
  });

  it('should not emit rating change when readonly', () => {
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    
    let emittedRating: number | undefined;
    component.ratingChange.subscribe((rating: number) => {
      emittedRating = rating;
    });
    
    const stars = fixture.nativeElement.querySelectorAll('i');
    stars[2].click();
    
    expect(emittedRating).toBeUndefined();
  });
});
