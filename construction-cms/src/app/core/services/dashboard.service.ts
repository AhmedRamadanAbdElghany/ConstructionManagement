import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
    activeProjects: number;
    completedProjects: number;
    delayedProjects: number;
    totalRevenue: number;
}

export interface SystemAdminStats {
    totalCompanies: number;
    activeSubscriptions: number;
    monthlyRecurringRevenue: number;
    pendingOnboardings: number;
    newCompaniesCount: number;
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
    timestamp: string;
}

export interface SystemAdminActivity {
    id: number;
    company: string;
    action: string;
    time: string;
    timestamp: string;
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
    getSystemAdminStats(): Observable<SystemAdminStats> {
        return this.http.get<SystemAdminStats>(`${this.apiUrl}/super-admin/stats`);
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

    getProjectActivities(projectId: number, limit?: number): Observable<RecentActivity[]> {
        let url = `${this.apiUrl}/projects/${projectId}/activities`;
        if (limit !== undefined) {
            url += `?limit=${limit}`;
        }
        return this.http.get<RecentActivity[]>(url);
    }

    // GET: api/dashboard/super-admin-activities
    getSystemAdminActivities(limit?: number): Observable<SystemAdminActivity[]> {
        let url = `${this.apiUrl}/super-admin-activities`;
        if (limit !== undefined) {
            url += `?limit=${limit}`;
        }
        return this.http.get<SystemAdminActivity[]>(url);
    }
}

