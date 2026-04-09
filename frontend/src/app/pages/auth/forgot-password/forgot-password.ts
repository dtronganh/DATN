
import { Component, afterNextRender, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import Aos from 'aos';
import { Footer } from "@shared/components/footer/footer";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '@core/services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from '@shared/components/button/button';

@Component({
  selector: 'app-forgot-password',
  imports: [
    RouterLink,
    Navbar,
    Footer,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule,
    Button
],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });

  getErrorMessage(controlName: string): string {
    const control = this.forgotPasswordForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return this.translate.instant('auth.errors.emailRequired');
    if (control.errors['email']) return this.translate.instant('auth.errors.invalidEmail');
    return '';
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.toastService.error(this.translate.instant('auth.errors.invalidEmailEntry'));
      return;
    }

    const { email } = this.forgotPasswordForm.getRawValue();
    this.toastService.info(this.translate.instant('auth.resetComingSoon'));
  }
}
