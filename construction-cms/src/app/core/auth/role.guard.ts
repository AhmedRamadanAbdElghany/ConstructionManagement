import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from '../../shared/interfaces';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as UserRole[];
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    router.navigate(['/dashboard']);
    return false;
  }

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (requiredRoles.includes(currentUser.role)) {
    return true;
  }

  // If user doesn't have access, redirect to dashboard
  router.navigate(['/dashboard']);
  return false;
};