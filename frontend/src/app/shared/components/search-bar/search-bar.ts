import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './search-bar.html'
})
export class SearchBarComponent {
  placeholder = input<string>('common.search');
  debounceTime = input<number>(400);
  size = input<'sm' | 'md' | 'lg'>('md');
  
  search = output<string>();

  searchQuery = '';
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTime()),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.search.emit(query);
      });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  inputClass(): string {
    const sizeMap = {
      sm: 'py-2 pl-10 pr-10 text-sm',
      md: 'py-3 pl-12 pr-12 text-base',
      lg: 'py-4 pl-14 pr-14 text-lg'
    };

    const sizeClass = sizeMap[this.size()];
    return `w-full ${sizeClass} text-title dark:text-white bg-white dark:bg-title border border-gray-200 dark:border-white/20 rounded-[8px] focus:outline-none focus:border-primary dark:focus:border-primary transition-colors`;
  }
}
