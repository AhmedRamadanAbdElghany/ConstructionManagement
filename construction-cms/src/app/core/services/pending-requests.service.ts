import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface CompanyRequest {
    id: number;
    userId: number;
    userFullName: string;
    userEmail: string;
    companyName: string;
    businessId?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    status: string;
    rejectionReason?: string;
    reviewedByUserId?: number;
    reviewedByFullName?: string;
    reviewedAt?: Date;
    createdAt: Date;
    notes?: string;
}

export interface ApproveCompanyRequestDto {
    config?: any; // Use the same structure as UpdateCompanyRequest in backend
}

export interface JoinRequest {
    id: number;
    userId: number;
    userFullName: string;
    userEmail: string;
    companyId: number;
    companyName: string;
    status: string;
    rejectionReason?: string;
    reviewedByUserId?: number;
    reviewedByFullName?: string;
    reviewedAt?: Date;
    createdAt: Date;
    message?: string;
    requestedRole?: string;
}

export interface PendingCounts {
    pendingCompanyRequests: number;
    pendingJoinRequests: number;
}

export interface PublicCompany {
    id: number;
    name: string;
    address?: string;
    logoUrl?: string;
    completedProjectsCount: number;
    subscriberCount: number;
    isSubscribed: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PendingRequestsService {
    private apiUrl = '/api';
    private http = inject(HttpClient);

    // Signal for total pending count (for sidebar badge)
    pendingRequests = signal(0);

    // Company Requests
    getCompanyRequests(): Observable<CompanyRequest[]> {
        return this.http.get<CompanyRequest[]>(`${this.apiUrl}/companyrequests`);
    }

    getPendingCompanyRequests(): Observable<CompanyRequest[]> {
        return this.http.get<CompanyRequest[]>(`${this.apiUrl}/companyrequests/pending`);
    }

    getPendingCompanyRequestsCount(): Observable<{ pendingCount: number }> {
        return this.http.get<{ pendingCount: number }>(`${this.apiUrl}/companyrequests/count`);
    }

    approveCompanyRequest(id: number, dto?: ApproveCompanyRequestDto): Observable<CompanyRequest> {
        return this.http.post<CompanyRequest>(`${this.apiUrl}/companyrequests/${id}/approve`, dto || {}).pipe(
            tap(() => this.refreshPendingCount())
        );
    }

    rejectCompanyRequest(id: number, reason: string): Observable<CompanyRequest> {
        return this.http.post<CompanyRequest>(`${this.apiUrl}/companyrequests/${id}/reject`, { rejectionReason: reason }).pipe(
            tap(() => this.refreshPendingCount())
        );
    }

    // Join Requests
    getJoinRequests(): Observable<JoinRequest[]> {
        return this.http.get<JoinRequest[]>(`${this.apiUrl}/joinrequests`);
    }

    getPendingJoinRequests(): Observable<JoinRequest[]> {
        return this.http.get<JoinRequest[]>(`${this.apiUrl}/joinrequests`);
    }

    getMyJoinRequests(): Observable<JoinRequest[]> {
        return this.http.get<JoinRequest[]>(`${this.apiUrl}/joinrequests/my-requests`);
    }

    getPendingJoinRequestsCount(): Observable<{ pendingCount: number }> {
        return this.http.get<{ pendingCount: number }>(`${this.apiUrl}/joinrequests/count`);
    }

    approveJoinRequest(id: number): Observable<JoinRequest> {
        return this.http.post<JoinRequest>(`${this.apiUrl}/joinrequests/${id}/approve`, {}).pipe(
            tap(() => this.refreshPendingCount())
        );
    }

    rejectJoinRequest(id: number, reason: string): Observable<JoinRequest> {
        return this.http.post<JoinRequest>(`${this.apiUrl}/joinrequests/${id}/reject`, { rejectionReason: reason }).pipe(
            tap(() => this.refreshPendingCount())
        );
    }

    getPublicCompanies(): Observable<PublicCompany[]> {
        return this.http.get<PublicCompany[]>(`${this.apiUrl}/publiccompanies`);
    }

    submitJoinRequest(companyId: number, message?: string, requestedRole?: string): Observable<JoinRequest> {
        return this.http.post<JoinRequest>(`${this.apiUrl}/joinrequests`, { companyId, message, requestedRole });
    }

    // Combined counts for badge
    getPendingCounts(): Observable<PendingCounts> {
        return this.http.get<PendingCounts>(`${this.apiUrl}/pending-requests/count`);
    }

    private authService = inject(AuthService); // NEW

    // ...

    // Refresh the pending count from server
    refreshPendingCount() {
        if (this.authService.hasRole('SuperAdmin')) {
            this.getPendingCompanyRequestsCount().subscribe({
                next: (res) => this.pendingRequests.set(res.pendingCount),
                error: (err) => console.error('Failed to refresh pending count:', err)
            });
        } else if (this.authService.hasRole('CompanyAdmin')) {
            this.getPendingJoinRequestsCount().subscribe({
                next: (res) => this.pendingRequests.set(res.pendingCount),
                error: (err) => console.error('Failed to refresh pending count:', err)
            });
        } else {
            this.pendingRequests.set(0);
        }
    }

    // Get count synchronously (for initial display)
    getCount(): number {
        return this.pendingRequests();
    }
}
