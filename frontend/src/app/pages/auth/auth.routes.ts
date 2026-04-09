import { Routes } from '@angular/router';
import { guestGuard } from '@core/auth/auth.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login').then(m => m.Login)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./register/register').then(m => m.Register)
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPassword)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
