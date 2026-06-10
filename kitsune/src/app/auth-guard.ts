import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const isAuth = localStorage.getItem('adminToken') !== null;

  if (isAuth) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};