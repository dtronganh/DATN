import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('provinces.open-api.vn')) {
    return next(req);
  }

  const authStore = inject(AuthStore);
  const token = authStore.accessToken();

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
