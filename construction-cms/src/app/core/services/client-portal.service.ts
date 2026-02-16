import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClientCompany {
    companyId: number;
    companyName: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    joinedAt: string;
}

export interface ClientPortalSettings {
    id: number;
    companyId: number;
    enableClientPortal: boolean;
    allowProjectProgressView: boolean;
    allowDocumentAccess: boolean;
    allowPaymentHistoryView: boolean;
    allowCommunicationHub: boolean;
    allowChangeOrderRequests: boolean;
    requireApprovalForChangeOrders: boolean;
    defaultTheme?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
}

export interface ClientUser {
    id: number;
    companyId: number; // Primary company (if any)
    companies?: ClientCompany[]; // All associated companies
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string;
    companyName: string;
    jobTitle?: string;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
}

export interface ClientLoginRequest {
    email: string;
    password: string;
}

export interface ClientLoginResponse {
    token: string;
    clientUser: ClientUser;
    expiresAt: string;
}

export interface ClientDashboard {
    projects: ClientProjectSummary[];
    paymentSummary: ClientPaymentSummary;
    recentMessages: ClientMessage[];
    unreadMessagesCount: number;
    pendingChangeOrdersCount: number;
    recentActivities: ClientActivity[];
}

export interface ClientProjectSummary {
    projectId: number;
    companyId?: number;
    companyName?: string;
    projectName: string;
    status: string;
    progressPercentage: number;
    startDate?: string;
    endDate?: string;
    location?: string;
    hasUpdates: boolean;
    lastUpdatedAt?: string;
}

export interface ClientPaymentSummary {
    totalInvoiced: number;
    totalPaid: number;
    pendingAmount: number;
    overdueAmount: number;
    pendingInvoicesCount: number;
    overdueInvoicesCount: number;
    recentPayments: ClientPayment[];
}

export interface ClientPayment {
    id: number;
    projectId: number;
    companyId?: number;
    companyName?: string;
    projectName: string;
    invoiceNumber: string;
    amount: number;
    paidAmount?: number;
    currency: string;
    invoiceDate: string;
    dueDate: string;
    paidDate?: string;
    status: string;
    paymentMethod?: string;
}

export interface ClientMessage {
    id: number;
    projectId?: number;
    companyId?: number;
    companyName?: string;
    projectName?: string;
    subject: string;
    content: string;
    messageType: string;
    priority: string;
    status: string;
    assignedToName?: string;
    createdAt: string;
    resolvedAt?: string;
    attachmentsCount: number;
    repliesCount: number;
    isUnread: boolean;
}

export interface ClientActivity {
    id: number;
    projectId?: number;
    companyId?: number;
    companyName?: string;
    projectName?: string;
    activityType: string;
    description: string;
    createdAt: string;
}

export interface ChangeOrderRequest {
    id: number;
    projectId: number;
    companyId?: number;
    companyName?: string;
    projectName: string;
    requestNumber: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    estimatedCost: number;
    estimatedDays: number;
    status: string;
    reviewerName?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    approvedBudget?: number;
    approvedDays?: number;
    createdAt: string;
    dueDate?: string;
}

export interface ClientProjectProgress {
    projectId: number;
    projectName: string;
    status: string;
    overallProgress: number;
    startDate?: string;
    endDate?: string;
    description?: string;
    location?: string;
    phases: PhaseProgress[];
    recentUpdates: RecentUpdate[];
    upcomingMilestones: UpcomingMilestone[];
}

export interface PhaseProgress {
    phaseId: number;
    phaseName: string;
    progress: number;
    status: string;
    startDate?: string;
    endDate?: string;
}

export interface RecentUpdate {
    id: number;
    type: string;
    title: string;
    description?: string;
    createdAt: string;
    mediaUrl?: string;
}

export interface UpcomingMilestone {
    id: number;
    name: string;
    scheduledDate: string;
    status: string;
}

export interface DailyReportFilter {
    projectId?: number;
    fromDate?: string;
    toDate?: string;
    searchTerm?: string;
}

export interface DailyReportList {
    projectId: number;
    projectName: string;
    companyId?: number;
    companyName?: string;
    reportDate: string;
    itemsCount: number;
    averageProgress: number;
    summary?: string;
    hasPhotos: boolean;
}

export interface DailyReportDetail {
    projectId: number;
    projectName: string;
    companyId?: number;
    companyName?: string;
    reportDate: string;
    logs: DailyLogItem[];
}

export interface DailyLogItem {
    itemId: number;
    itemName: string;
    progressNotes?: string;
    issues?: string;
    progressPercentage: number;
    photoUrls: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ClientPortalService {
    private apiUrl = 'api/clientportal';
    private http = inject(HttpClient);

    // Settings
    getClientPortalSettings(): Observable<ClientPortalSettings> {
        return this.http.get<ClientPortalSettings>(`${this.apiUrl}/settings`);
    }

    updateClientPortalSettings(settings: Partial<ClientPortalSettings>): Observable<ClientPortalSettings> {
        return this.http.put<ClientPortalSettings>(`${this.apiUrl}/settings`, settings);
    }

    getMyCompanies(): Observable<ClientCompany[]> {
        return this.http.get<ClientCompany[]>(`${this.apiUrl}/my-companies`);
    }

    // Client Users (Admin)
    getClientUsers(): Observable<ClientUser[]> {
        return this.http.get<ClientUser[]>(`${this.apiUrl}/clients`);
    }

    getClientUser(id: number): Observable<ClientUser> {
        return this.http.get<ClientUser>(`${this.apiUrl}/clients/${id}`);
    }

    createClientUser(user: any): Observable<ClientUser> {
        return this.http.post<ClientUser>(`${this.apiUrl}/clients`, user);
    }

    updateClientUser(id: number, user: Partial<ClientUser>): Observable<ClientUser> {
        return this.http.put<ClientUser>(`${this.apiUrl}/clients/${id}`, user);
    }

    deleteClientUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/clients/${id}`);
    }

    grantProjectAccess(clientUserId: number, access: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/clients/${clientUserId}/access`, access);
    }

    // Client Authentication
    clientLogin(request: ClientLoginRequest): Observable<ClientLoginResponse> {
        return this.http.post<ClientLoginResponse>(`${this.apiUrl}/login`, request);
    }

    changeClientPassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, { currentPassword, newPassword });
    }

    resetClientPassword(email: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { email });
    }

    setClientPassword(token: string, newPassword: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/set-password`, { token, newPassword });
    }

    // Client Dashboard
    getClientDashboard(): Observable<ClientDashboard> {
        return this.http.get<ClientDashboard>(`${this.apiUrl}/dashboard`);
    }

    // Client Payments
    getClientPayments(projectId?: number): Observable<ClientPayment[]> {
        let params = new HttpParams();
        if (projectId) params = params.set('projectId', projectId.toString());
        return this.http.get<ClientPayment[]>(`${this.apiUrl}/payments`, { params });
    }

    getClientPaymentSummary(): Observable<ClientPaymentSummary> {
        return this.http.get<ClientPaymentSummary>(`${this.apiUrl}/payments/summary`);
    }

    // Client Messages
    getClientMessages(status?: string): Observable<ClientMessage[]> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        return this.http.get<ClientMessage[]>(`${this.apiUrl}/messages`, { params });
    }

    getClientMessage(id: number): Observable<ClientMessage> {
        return this.http.get<ClientMessage>(`${this.apiUrl}/messages/${id}`);
    }

    createClientMessage(message: any): Observable<ClientMessage> {
        return this.http.post<ClientMessage>(`${this.apiUrl}/messages`, message);
    }

    replyToMessage(messageId: number, content: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/messages/${messageId}/replies`, { content });
    }

    getMessageReplies(messageId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/messages/${messageId}/replies`);
    }

    // Change Orders
    getChangeOrderRequests(projectId?: number): Observable<ChangeOrderRequest[]> {
        let params = new HttpParams();
        if (projectId) params = params.set('projectId', projectId.toString());
        return this.http.get<ChangeOrderRequest[]>(`${this.apiUrl}/change-orders`, { params });
    }

    getChangeOrderRequest(id: number): Observable<ChangeOrderRequest> {
        return this.http.get<ChangeOrderRequest>(`${this.apiUrl}/change-orders/${id}`);
    }

    createChangeOrderRequest(request: any): Observable<ChangeOrderRequest> {
        return this.http.post<ChangeOrderRequest>(`${this.apiUrl}/change-orders`, request);
    }

    updateChangeOrderRequest(id: number, request: any): Observable<ChangeOrderRequest> {
        return this.http.put<ChangeOrderRequest>(`${this.apiUrl}/change-orders/${id}`, request);
    }

    cancelChangeOrderRequest(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/change-orders/${id}`);
    }

    // Project Progress
    getClientProjects(): Observable<ClientProjectSummary[]> {
        return this.http.get<ClientProjectSummary[]>(`${this.apiUrl}/projects`);
    }

    getClientProjectProgress(projectId: number): Observable<ClientProjectProgress> {
        return this.http.get<ClientProjectProgress>(`${this.apiUrl}/projects/${projectId}/progress`);
    }

    // Activities
    getClientActivities(count: number = 20): Observable<ClientActivity[]> {
        return this.http.get<ClientActivity[]>(`${this.apiUrl}/activities`, { params: { count: count.toString() } });
    }

    // Admin Message Management
    getAllClientMessages(status?: string, assignedTo?: number): Observable<ClientMessage[]> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        if (assignedTo) params = params.set('assignedTo', assignedTo.toString());
        return this.http.get<ClientMessage[]>(`${this.apiUrl}/admin/messages`, { params });
    }

    assignMessage(messageId: number, userId: number): Observable<ClientMessage> {
        return this.http.put<ClientMessage>(`${this.apiUrl}/admin/messages/${messageId}/assign?assignedToUserId=${userId}`, {});
    }

    updateMessageStatus(messageId: number, status: string): Observable<ClientMessage> {
        return this.http.put<ClientMessage>(`${this.apiUrl}/admin/messages/${messageId}/status?status=${status}`, {});
    }

    resolveMessage(messageId: number, resolution: string): Observable<ClientMessage> {
        return this.http.put<ClientMessage>(`${this.apiUrl}/admin/messages/${messageId}/resolve`, resolution);
    }

    // Admin Change Order Management
    getAllChangeOrders(status?: string, projectId?: number): Observable<ChangeOrderRequest[]> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        if (projectId) params = params.set('projectId', projectId.toString());
        return this.http.get<ChangeOrderRequest[]>(`${this.apiUrl}/admin/change-orders`, { params });
    }

    reviewChangeOrder(requestId: number, status: string, notes?: string, budget?: number, days?: number): Observable<ChangeOrderRequest> {
        let params = new HttpParams()
            .set('status', status);
        if (notes) params = params.set('notes', notes);
        if (budget) params = params.set('budget', budget.toString());
        if (days) params = params.set('days', days.toString());
        return this.http.put<ChangeOrderRequest>(`${this.apiUrl}/admin/change-orders/${requestId}/review`, {}, { params });
    }

    // Daily Reports
    getDailyReports(filter: DailyReportFilter): Observable<DailyReportList[]> {
        let params = new HttpParams();
        if (filter.projectId) params = params.set('projectId', filter.projectId.toString());
        if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
        if (filter.toDate) params = params.set('toDate', filter.toDate);
        if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);

        return this.http.get<DailyReportList[]>(`${this.apiUrl}/reports`, { params });
    }

    getDailyReportDetails(projectId: number, reportDate: string): Observable<DailyReportDetail> {
        return this.http.get<DailyReportDetail>(`${this.apiUrl}/reports/${projectId}/${reportDate}`);
    }

    // Utility methods
    formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(dateString: string): string {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'paid':
            case 'resolved':
            case 'completed':
            case 'approved':
                return 'success';
            case 'pending':
            case 'submitted':
            case 'inprogress':
                return 'warning';
            case 'overdue':
            case 'rejected':
            case 'cancelled':
                return 'danger';
            default:
                return 'info';
        }
    }

    getPriorityClass(priority: string): string {
        switch (priority.toLowerCase()) {
            case 'urgent':
                return 'danger';
            case 'high':
                return 'warning';
            case 'medium':
                return 'info';
            default:
                return 'secondary';
        }
    }
}
