import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './password-input.html',
  styles: [
    `
      .auth-password-input::-ms-reveal,
      .auth-password-input::-ms-clear {
        display: none;
      }

      .auth-password-input::-webkit-credentials-auto-fill-button,
      .auth-password-input::-webkit-contacts-auto-fill-button {
        visibility: hidden;
        display: none !important;
        pointer-events: none;
        position: absolute;
        right: 0;
      }
    `
  ]
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
