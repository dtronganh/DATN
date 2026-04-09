import { Routes } from '@angular/router';
import { authGuard, clientGuard } from '@core/auth/auth.guard';

export const clientRoutes: Routes = [
  {
    path: '',
    canActivate: [clientGuard],
    loadComponent: () => import('./index/index').then(m => m.Index)
  },
  {
    path: 'product-details',
    canActivate: [clientGuard],
    loadComponent: () => import('./shop/product-details/product-details').then(m => m.ProductDetails)
  },
  {
    path: 'product-details/:id',
    canActivate: [clientGuard],
    loadComponent: () => import('./shop/product-details/product-details').then(m => m.ProductDetails)
  },
  {
    path: 'product-category',
    canActivate: [clientGuard],
    loadComponent: () => import('./shop/product-category/product-category').then(m => m.ProductCategory)
  },
  {
    path: 'product-category/:id',
    canActivate: [clientGuard],
    loadComponent: () => import('./shop/product-category/product-category').then(m => m.ProductCategory)
  },
  {
    path: 'cart',
    canActivate: [authGuard, clientGuard],
    loadComponent: () => import('./shop/cart/cart').then(m => m.Cart)
  },
  {
    path: 'checkout',
    canActivate: [authGuard, clientGuard],
    loadComponent: () => import('./shop/checkout/checkout').then(m => m.Checkout)
  },
  {
    path: 'shipping-method',
    canActivate: [authGuard, clientGuard],
    loadComponent: () => import('./shop/shipping-method/shipping-method').then(m => m.ShippingMethod)
  },
  {
    path: 'payment-method',
    canActivate: [authGuard, clientGuard],
    loadComponent: () => import('./shop/payment-method/payment-method').then(m => m.PaymentMethod)
  },
  {
    path: 'payment-confirmation',
    canActivate: [authGuard, clientGuard],
    loadComponent: () => import('./shop/payment-confirmation/payment-confirmation').then(m => m.PaymentConfirmation)
  },
  {
    path: 'payment-success',
    canActivate: [authGuard, clientGuard],
    loadComponent: () => import('./shop/payment-success/payment-success').then(m => m.PaymentSuccess)
  },
  {
    path: 'payment-failure',
    canActivate: [authGuard, clientGuard],
    loadComponent: () => import('./shop/payment-failure/payment-failure').then(m => m.PaymentFailure)
  },
  {
    path: 'invoice',
    canActivate: [authGuard],
    loadComponent: () => import('./shop/invoice/invoice').then(m => m.Invoice)
  },
  {
    path: 'about',
    canActivate: [clientGuard],
    loadComponent: () => import('./inner-pages/about/about').then(m => m.About)
  },
  {
    path: 'contact',
    canActivate: [clientGuard],
    loadComponent: () => import('./inner-pages/contact/contact').then(m => m.Contact)
  },
  
  {
    path: 'my-profile',
    loadComponent: () => import('./profile/my-profile/my-profile').then(m => m.MyProfile),
    canActivate: [authGuard, clientGuard]
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./profile/edit-profile/edit-profile').then(m => m.EditProfile),
    canActivate: [authGuard, clientGuard]
  },
  {
    path: 'order-history',
    loadComponent: () => import('./profile/order-history/order-history').then(m => m.OrderHistory),
    canActivate: [authGuard, clientGuard]
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./profile/wishlist/wishlist').then(m => m.Wishlist),
    canActivate: [authGuard, clientGuard]
  },
  
  {
    path: 'error',
    canActivate: [clientGuard],
    loadComponent: () => import('./special/error/error').then(m => m.Error)
  },
  {
    path: 'thank-you',
    canActivate: [clientGuard],
    loadComponent: () => import('./special/thank-you/thank-you').then(m => m.ThankYou)
  },
  
  {
    path: '**',
    canActivate: [clientGuard],
    loadComponent: () => import('./special/error/error').then(m => m.Error)
  }
];
