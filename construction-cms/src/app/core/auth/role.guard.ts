import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Check if user has any of the required roles (user.roles is an array)
  const userRoles = currentUser.roles || [];
  const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

  if (hasRequiredRole) {
    return true;
  }

  // Special handling for InventoryOwner - check userType
  // InventoryOwner is UserType 3, which is a user type not a role
  if (requiredRoles.includes('InventoryOwner') && currentUser.userType === 3) {
    return true;
  }

  // If user doesn't have access, redirect to appropriate dashboard
  if (currentUser.userType === 3) {
    router.navigate(['/inventory-dashboard']);
  } else {
    router.navigate(['/dashboard']);
  }
  return false;
};