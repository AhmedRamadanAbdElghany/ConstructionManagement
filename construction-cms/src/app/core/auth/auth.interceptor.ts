// src/app/core/auth/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  const tenantId = 'tenant_123';
  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${dummyToken}`,
      'X-Tenant-ID': tenantId
    }
  });
  return next(clonedReq);
};