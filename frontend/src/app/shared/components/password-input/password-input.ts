import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './password-input.html'
})
export class PasswordInputComponent {
  control = input.required<FormControl>();
  placeholder = input<string>('* * * * * * * *');
  label = input<string>('');
  errorMessage = input<string>('');
  
  showPassword = signal(false);

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }
}
