import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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
}

export interface PendingCounts {
    pendingCompanyRequests: number;
    pendingJoinRequests: number;
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

    approveCompanyRequest(id: number): Observable<CompanyRequest> {
        return this.http.post<CompanyRequest>(`${this.apiUrl}/companyrequests/${id}/approve`, {}).pipe(
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

    // Combined counts for badge
    getPendingCounts(): Observable<PendingCounts> {
        return this.http.get<PendingCounts>(`${this.apiUrl}/pending-requests/count`);
    }

    // Refresh the pending count from server
    refreshPendingCount() {
        this.getPendingCounts().subscribe({
            next: (counts) => {
                const total = counts.pendingCompanyRequests + counts.pendingJoinRequests;
                this.pendingRequests.set(total);
            },
            error: (err) => console.error('Failed to refresh pending count:', err)
        });
    }

    // Get count synchronously (for initial display)
    getCount(): number {
        return this.pendingRequests();
    }
}
