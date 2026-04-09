import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './empty-state.html'
})
export class EmptyStateComponent {
  icon = input<string>('lnr-inbox');
  message = input.required<string>();
  actionText = input<string>('');
  actionLink = input<string>('');
  centered = input<boolean>(true);
  size = input<'sm' | 'md' | 'lg'>('md');

  containerClass() {
    const base = this.centered() ? 'text-center' : '';
    const padding = this.size() === 'sm' ? 'p-6' : this.size() === 'lg' ? 'p-16' : 'p-12';
    return `${base} ${padding}`.trim();
  }

  iconClass() {
    const sizeMap = {
      sm: 'text-3xl',
      md: 'text-4xl',
      lg: 'text-5xl'
    };
    const sizeClass = sizeMap[this.size()];
    return `lnr ${this.icon()} ${sizeClass} text-title/20 dark:text-white/20`;
  }
}
