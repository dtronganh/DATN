import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthStore } from './auth.store';
import { ToastService } from '@core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const toast = inject(ToastService);
  const translate = inject(TranslateService);

  if (authStore.isAuthenticated()) {
    return true;
  }

  toast.warning(translate.instant('auth.toasts.loginRequired'));
  router.navigate(['/auth/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const toast = inject(ToastService);
  const translate = inject(TranslateService);

  if (!authStore.isAuthenticated()) {
    toast.warning(translate.instant('auth.toasts.loginRequired'));
    router.navigate(['/auth/login']);
    return false;
  }

  if (authStore.isAdmin()) {
    return true;
  }

  toast.error('Bạn không có quyền truy cập trang quản trị');
  router.navigate(['/']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    return true;
  }

  if (authStore.isAdmin()) {
    router.navigate(['/admin']);
  } else {
    router.navigate(['/']);
  }
  return false;
};

export const clientGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  
  if (authStore.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};
