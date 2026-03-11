import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 🔹 Auth Layout (Login)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
      },
    ],
  },
  
  // 🔹 Main Layout (Dashboard)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/Categoiers/category.route').then(
            (m) => m.MAIN_CATEGORY_ROUTES,
          ),
      },
      {
        path: 'Products',
        loadChildren: () =>
          import('./features/Products/product.routes').then(
            (m) => m.MAIN_PRODUCT_ROUTES,
          ),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // 🔹 Fallback
  { path: '**', redirectTo: '/auth/login' },
];
