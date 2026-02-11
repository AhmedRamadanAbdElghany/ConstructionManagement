import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
    activeProjects: number;
    completedProjects: number;
    delayedProjects: number;
    totalRevenue: number;
}

export interface SuperAdminStats {
    totalCompanies: number;
    activeSubscriptions: number;
    monthlyRecurringRevenue: number;
    pendingOnboardings: number;
}

export interface CompanySubscription {
    id: number;
    companyName: string;
    packageName: string;
    startDate: string;
    endDate?: string;
    status: string;
    amount: number;
}

export interface RecentActivity {
    id: number;
    type: string;
    message: string;
    time: string;
}

export interface SuperAdminActivity {
    id: number;
    company: string;
    action: string;
    time: string;
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = 'api/dashboard';

    constructor(private http: HttpClient) { }

    // GET: api/dashboard/stats
    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
    }

    // GET: api/dashboard/super-admin/stats
    getSuperAdminStats(): Observable<SuperAdminStats> {
        return this.http.get<SuperAdminStats>(`${this.apiUrl}/super-admin/stats`);
    }

    // GET: api/dashboard/subscriptions
    getCompanySubscriptions(): Observable<CompanySubscription[]> {
        return this.http.get<CompanySubscription[]>(`${this.apiUrl}/subscriptions`);
    }

    // GET: api/dashboard/activities
    getRecentActivities(limit?: number): Observable<RecentActivity[]> {
        let url = `${this.apiUrl}/activities`;
        if (limit !== undefined) {
            url += `?limit=${limit}`;
        }
        return this.http.get<RecentActivity[]>(url);
    }

    // GET: api/dashboard/super-admin-activities
    getSuperAdminActivities(limit?: number): Observable<SuperAdminActivity[]> {
        let url = `${this.apiUrl}/super-admin-activities`;
        if (limit !== undefined) {
            url += `?limit=${limit}`;
        }
        return this.http.get<SuperAdminActivity[]>(url);
    }
}
