import { Routes } from '@angular/router';
import { adminGuard } from '@core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.adminRoutes)
  },
  
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes)
  },
  
  {
    path: '',
    loadChildren: () => import('./pages/client/client.routes').then(m => m.clientRoutes)
  }
];
