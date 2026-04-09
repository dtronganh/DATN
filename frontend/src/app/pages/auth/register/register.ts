
import { Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import Aos from 'aos';
import { Footer } from "@shared/components/footer/footer";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApi } from '@core/api/auth.api';
import { UserApi } from '@core/api/user.api';
import { AuthStore } from '@core/auth/auth.store';
import { ToastService } from '@core/services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from '@shared/components/button/button';
import { PasswordInputComponent, CheckboxComponent } from '@shared/components';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [
    RouterLink,
    Navbar,
    Footer,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule,
    Button,
    PasswordInputComponent,
    CheckboxComponent
],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApi);
  private userApi = inject(UserApi);
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(80)]]
  });

  rememberMe = signal(false);

  toggleRememberMe(checked: boolean) {
    this.rememberMe.set(checked);
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      if (controlName === 'password') return this.translate.instant('auth.errors.passwordRequired');
      if (controlName === 'fullName') return this.translate.instant('auth.errors.fullNameRequired');
      return this.translate.instant('auth.errors.emailRequired');
    }
    if (control.errors['email']) return this.translate.instant('auth.errors.invalidEmail');
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      if (controlName === 'fullName') return this.translate.instant('auth.errors.fullNameMin', { min: minLength });
      return this.translate.instant('auth.errors.passwordMin', { min: minLength });
    }
    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      if (controlName === 'fullName') return this.translate.instant('auth.errors.fullNameMax', { max: maxLength });
      return this.translate.instant('auth.errors.passwordMax', { max: maxLength });
    }
    return '';
  }

  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });

  onSubmit() {
    if (this.registerForm.invalid) return;

    const { fullName, email, password } = this.registerForm.getRawValue();
    
    if (!fullName || !email || !password) return;

    this.authApi.register({ fullName, email, password }).subscribe({
      next: (response) => {
        if (response.success) {
          this.authStore.setTokens(response.data.accessToken, response.data.refreshToken, this.rememberMe());
          
          this.userApi.getProfile().subscribe({
            next: (userResponse) => {
              if (userResponse.success) {
                this.authStore.updateUser(userResponse.data);
                this.toastService.success(this.translate.instant('auth.registerSuccess'));
                
                if (userResponse.data.role === 'admin') {
                  this.router.navigate(['/admin']);
                } else {
                  this.router.navigate(['/']);
                }
              }
            }
          });
        }
      },
      error: (err) => {
        let errorMessage = this.translate.instant('auth.registerFailed');
        
        if (err?.error?.message && typeof err.error.message === 'string') {
          errorMessage = err.error.message;
        } else if (err?.status === 409) {
          errorMessage = this.translate.instant('auth.errors.emailExists');
        } else if (err?.status === 400) {
          errorMessage = this.translate.instant('auth.errors.invalidRegistration');
        } else if (err?.status >= 500) {
          errorMessage = this.translate.instant('auth.errors.serverError');
        }
        
        this.toastService.error(errorMessage);
      }
    });
  }
}
