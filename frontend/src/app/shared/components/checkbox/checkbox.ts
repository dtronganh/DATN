import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './checkbox.html'
})
export class CheckboxComponent {
  checked = input<boolean>(false);
  label = input<string>('');
  disabled = input<boolean>(false);
  size = input<'sm' | 'md' | 'lg'>('md');
  
  checkedChange = output<boolean>();

  onToggle() {
    if (!this.disabled()) {
      this.checkedChange.emit(!this.checked());
    }
  }

  checkboxClass() {
    const sizeMap = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };
    const sizeClass = sizeMap[this.size()];
    const bgClass = this.checked() ? 'bg-primary' : 'bg-white dark:bg-title';
    const borderClass = this.checked() ? 'border-primary' : 'border-[#E0E0E0] dark:border-white/20';
    
    return `${sizeClass} rounded-[5px] border flex items-center justify-center transition-all duration-200 ${bgClass} ${borderClass}`;
  }

  svgClass() {
    return this.checked() ? 'opacity-100 text-white' : 'opacity-0';
  }

  labelClass() {
    return 'text-base leading-none text-title dark:text-white select-none';
  }
}
