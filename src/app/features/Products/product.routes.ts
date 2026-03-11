import { Routes } from '@angular/router';

export const MAIN_PRODUCT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'product',
    pathMatch: 'full',
  },
  {
    path: 'product',
    loadComponent: () =>
      import('./pages/product/product.component').then(
        (m) => m.ProductComponent,
      ),
    title: 'إدارة المنتجات',
  },
];
