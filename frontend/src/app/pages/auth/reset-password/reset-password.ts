import { Component, afterNextRender, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import Aos from 'aos';
import { Footer } from "@shared/components/footer/footer";
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '@core/services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from '@shared/components/button/button';
import { AuthApi } from '@core/api/auth.api';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    RouterLink,
    Navbar,
    Footer,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule,
    Button
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private authApi = inject(AuthApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token: string | null = null;

  resetPasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.toastService.error('Invalid or missing reset token');
      this.router.navigate(['/auth/login']);
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
  }

  getErrorMessage(controlName: string): string {
    const control = this.resetPasswordForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['minlength']) return 'Password must be at least 6 characters';
    return '';
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid || !this.token) {
      return;
    }

    const { password } = this.resetPasswordForm.getRawValue();
    
    this.authApi.resetPassword(this.token, password!).subscribe({
      next: () => {
        this.toastService.success('Password has been reset successfully!');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.toastService.error('Failed to reset password. Token may be invalid or expired.');
      }
    });
  }
}
