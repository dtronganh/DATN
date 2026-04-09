import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './loading-spinner.html'
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  message = input<string>('');
  centered = input<boolean>(true);

  containerClass() {
    const base = this.centered() ? 'text-center' : '';
    const padding = this.size() === 'sm' ? 'p-4' : this.size() === 'lg' ? 'p-16' : 'p-12';
    return `${base} ${padding}`.trim();
  }

  spinnerClass() {
    const sizeMap = {
      sm: 'w-6 h-6 border-2',
      md: 'w-8 h-8 border-2',
      lg: 'w-12 h-12 border-[3px]'
    };

    const sizeClass = sizeMap[this.size()];
    return `inline-block ${sizeClass} border-primary border-t-transparent rounded-full animate-spin`;
  }
}
