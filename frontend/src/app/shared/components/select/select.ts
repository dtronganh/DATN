import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './select.html'
})
export class SelectComponent {
  control = input.required<FormControl>();
  label = input<string>('');
  placeholder = input<string>('');
  options = input<SelectOption[]>([]);
  required = input<boolean>(false);
  error = input<string>('');
  containerClass = input<string>('');
  
  changed = output<any>();

  onChange(): void {
    this.changed.emit(this.control().value);
  }
}
