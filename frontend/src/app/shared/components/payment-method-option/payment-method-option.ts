import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-method-option',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './payment-method-option.html',
  styleUrl: './payment-method-option.css',
  host: {
    '(click)': 'select()'
  }
})
export class PaymentMethodOptionComponent {
  value = input.required<string>();
  titleKey = input.required<string>();
  descKey = input.required<string>();
  iconPath = input.required<string>();
  isSelected = input.required<boolean>();
  
  selectClicked = output<void>();

  select(): void {
    this.selectClicked.emit();
  }

  labelClass(): string {
    const baseClass = 'block p-5 border-2 rounded-lg cursor-pointer transition-all duration-300';
    const borderClass = this.isSelected()
      ? 'border-primary'
      : 'border-gray-300 dark:border-gray-600';
    const bgClass = this.isSelected()
      ? 'bg-white dark:bg-title'
      : 'bg-transparent';

    return `${baseClass} ${borderClass} ${bgClass}`;
  }
}
