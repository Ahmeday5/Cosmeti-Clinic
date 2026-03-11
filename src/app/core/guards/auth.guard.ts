import { CanActivateFn, Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AuthLayoutComponent } from '../../layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn$.pipe(
    map((isLogged) =>
      isLogged ? true : router.createUrlTree(['/auth/login']),
    ),
  );
};

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn$.pipe(
    map((isLogged) => (isLogged ? router.createUrlTree(['/dashboard']) : true)),
  );
};
