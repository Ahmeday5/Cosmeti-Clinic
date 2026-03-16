import { Routes } from '@angular/router';

export const MAIN_PRODUCT_ROUTES: Routes = [
  {
    path: 'product',
    loadComponent: () =>
      import('./pages/product/product.component').then(
        (m) => m.ProductComponent,
      ),
    title: 'إدارة المنتجات',
  },
  {
    path: 'product/:headContentId',
    loadComponent: () =>
      import('./pages/product/product.component').then(
        (m) => m.ProductComponent,
      ),
    title: 'المنتجات حسب المحتوي الراسي',
  },
];
