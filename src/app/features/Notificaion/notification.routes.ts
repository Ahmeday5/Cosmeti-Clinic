import { Routes } from '@angular/router';

export const NOTIFICATION_ROUTES: Routes = [
  {
    path: 'notificaion',
    loadComponent: () =>
      import('./pages/notificaion/notificaion.component').then(
        (m) => m.NotificaionComponent,
      ),
    title: 'الاشعارات',
  },
];
