// src/app/core/auth/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');
  const tenantId = 'tenant_123'; // This could also come from localStorage or a service

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': tenantId
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
