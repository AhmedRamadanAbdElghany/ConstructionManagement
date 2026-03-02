// src/app/core/auth/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth interceptor that adds authentication, tenant, and language headers to all HTTP requests.
 * Language headers support bilingual (Arabic/English) API responses.
 * Arabic is the primary language as per application requirements.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');
  const tenantId = 'tenant_123'; // This could also come from localStorage or a service

  // Get the current language from localStorage (using the same key as I18nService) or default to English (primary language)
  const currentLanguage = localStorage.getItem('app-language') || 'en';

  // Get selected company ID for multi-company context
  const selectedCompanyId = localStorage.getItem('selectedCompanyId');

  // Build headers object
  const headers: Record<string, string> = {
    'Accept-Language': currentLanguage,
    'X-Language': currentLanguage
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add tenant ID
  headers['X-Tenant-ID'] = tenantId;

  // Add selected company context for multi-company support
  if (selectedCompanyId) {
    headers['X-Company-ID'] = selectedCompanyId;
  }

  // Clone request with all headers
  const clonedReq = req.clone({
    setHeaders: headers
  });

  return next(clonedReq);
};
