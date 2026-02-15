import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClientPortalService } from '../services/client-portal.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const companyApprovalGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const clientPortalService = inject(ClientPortalService);

    return clientPortalService.getMyCompanies().pipe(
        map(companies => {
            // Check if user has at least one approved company
            const hasApprovedCompany = companies.some(c => c.status === 'Approved');

            if (hasApprovedCompany) {
                return true;
            }

            // If no approved companies, redirect to browse firms or a restricted page
            // For now, redirecting to browse-firms as a safe default for unapproved users
            router.navigate(['/browse-firms'], {
                queryParams: {
                    returnUrl: state.url,
                    reason: 'approval_required'
                }
            });
            return false;
        }),
        catchError(() => {
            // On error (e.g. network issue), also redirect safely
            router.navigate(['/auth/login']);
            return of(false);
        })
    );
};
