import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardPage),
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () => import('./products/product-list/product-list').then(m => m.ProductListPage),
          },
          {
            path: 'categories',
            loadComponent: () => import('./products/category-manager/category-manager').then(m => m.CategoryManagerPage),
          },
          {
            path: 'new',
            loadComponent: () => import('./products/product-form/product-form').then(m => m.ProductFormPage),
          },
          {
            path: 'description-editor',
            loadComponent: () => import('./products/description-editor/description-editor').then(m => m.DescriptionEditorPage),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./products/product-form/product-form').then(m => m.ProductFormPage),
          },
        ]
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/orders').then(m => m.OrdersPage),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users').then(m => m.UsersPage),
      },
    ]
  },
];
