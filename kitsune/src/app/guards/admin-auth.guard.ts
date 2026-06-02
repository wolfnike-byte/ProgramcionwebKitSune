import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth/admin-auth';

export const adminAuthGuard: CanActivateFn = async () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  const isAuthenticated = auth.isAuthenticated || await auth.refreshSession();

  if (isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['/login-admin']);
};
