import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'mainDashboard',
    pathMatch: 'full',
  },
  {
    path: 'mainDashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'اللوحة الرئيسية',
  },
];
