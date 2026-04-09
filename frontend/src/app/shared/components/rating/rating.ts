import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating.html'
})
export class RatingComponent {
  rating = input<number>(0);
  maxStars = input<number>(5);
  readonly = input<boolean>(true);
  size = input<'sm' | 'md' | 'lg'>('md');
  showStock = input<boolean>(false);
  stock = input<number | null>(null);
  
  ratingChange = output<number>();

  stars = signal<boolean[]>([]);

  activeStarClass = signal<string>('fa-solid fa-star text-[#EE9818] text-[14px]');
  inactiveStarClass = signal<string>('fa-solid fa-star text-slate-300 text-[14px]');

  constructor() {
    this.updateStars();
  }

  ngOnInit() {
    this.updateSizeClasses();
    this.updateStars();
  }

  ngOnChanges() {
    this.updateStars();
    this.updateSizeClasses();
  }

  private updateStars() {
    const ratingValue = this.rating();
    const max = this.maxStars();
    const starsArray: boolean[] = [];
    
    for (let i = 0; i < max; i++) {
      starsArray.push(i < ratingValue);
    }
    
    this.stars.set(starsArray);
  }

  private updateSizeClasses() {
    const sizeMap = {
      sm: 'text-[12px]',
      md: 'text-[14px]',
      lg: 'text-[18px]'
    };

    const sizeClass = sizeMap[this.size()];
    this.activeStarClass.set(`fa-solid fa-star text-[#EE9818] ${sizeClass}`);
    this.inactiveStarClass.set(`fa-solid fa-star text-slate-300 ${sizeClass}`);
  }

  onStarClick(index: number) {
    if (!this.readonly()) {
      const newRating = index + 1;
      this.ratingChange.emit(newRating);
    }
  }
}
