import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Types
export type PaymentType = 'Advance' | 'OnAccount' | 'Progress' | 'Final';
export type PaymentMethod = 'Cash' | 'BankTransfer' | 'Check' | 'CreditCard';
export type PaymentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Bounced';

export interface ClientPaymentListItem {
    id: number;
    projectId: number;
    projectName: string;
    paymentType: string;
    paymentTypeDisplayName: string;
    amount: number;
    currency: string;
    paymentDate: string;
    receiptNumber?: string;
    paymentMethod: string;
    paymentMethodDisplayName: string;
    status: string;
    statusDisplayName: string;
    notes?: string;
    progressInvoiceId?: number;
    progressInvoiceNumber?: string;
    createdByFullName?: string;
    createdAt: string;
}

export interface ClientPayment {
    id: number;
    projectId: number;
    projectName: string;
    paymentType: string;
    paymentTypeDisplayName: string;
    amount: number;
    currency: string;
    paymentDate: string;
    receiptNumber?: string;
    paymentMethod: string;
    paymentMethodDisplayName: string;
    bankName?: string;
    checkNumber?: string;
    checkDueDate?: string;
    progressInvoiceId?: number;
    progressInvoiceNumber?: string;
    notes?: string;
    attachmentPath?: string;
    status: string;
    statusDisplayName: string;
    confirmedByUserId?: number;
    confirmedByFullName?: string;
    confirmedAt?: string;
    createdByUserId: number;
    createdByFullName?: string;
    createdAt: string;
}

export interface CreateClientPaymentRequest {
    projectId: number;
    paymentType: PaymentType | string;
    amount: number;
    currency?: string;
    paymentDate?: string;
    receiptNumber?: string;
    paymentMethod?: PaymentMethod | string;
    bankName?: string;
    checkNumber?: string;
    checkDueDate?: string;
    progressInvoiceId?: number;
    notes?: string;
    attachmentPath?: string;
}

export interface UpdateClientPaymentRequest {
    paymentType?: PaymentType | string;
    amount?: number;
    currency?: string;
    paymentDate?: string;
    receiptNumber?: string;
    paymentMethod?: PaymentMethod | string;
    bankName?: string;
    checkNumber?: string;
    checkDueDate?: string;
    progressInvoiceId?: number;
    notes?: string;
    attachmentPath?: string;
}

export interface ClientPaymentFilter {
    projectId?: number;
    paymentType?: string;
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    searchTerm?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}

export interface PagedClientPaymentResult {
    items: ClientPaymentListItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface ClientPaymentStatistics {
    totalPayments: number;
    pendingPayments: number;
    confirmedPayments: number;
    totalAmount: number;
    pendingAmount: number;
    confirmedAmount: number;
    advancePaymentsTotal: number;
    progressPaymentsTotal: number;
    onAccountPaymentsTotal: number;
    finalPaymentsTotal: number;
}

export interface ProjectFinancialSummary {
    projectId: number;
    projectName: string;
    totalContractValue?: number;

    // Expenses
    totalExpenses: number;
    confirmedExpenses: number;
    pendingExpenses: number;
    draftExpenses: number;

    // Client Payments
    totalClientPayments: number;
    advancePayments: number;
    progressPayments: number;
    onAccountPayments: number;
    finalPayments: number;
    pendingPayments: number;
    confirmedPayments: number;

    // Balance
    balance: number;
    balanceStatus: string;
    balancePercentage: number;

    // Alerts
    alertLevel: string;
    alertMessage?: string;

    // Progress Invoices
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    totalInvoiced: number;
    totalCollected: number;
}

@Injectable({
    providedIn: 'root'
})
export class ClientPaymentsService {
    private apiUrl = 'api/client-payments';

    constructor(private http: HttpClient) { }

    // ==================== Payment CRUD ====================

    /**
     * Get all client payments with filtering and pagination
     */
    getPayments(filter?: ClientPaymentFilter): Observable<PagedClientPaymentResult> {
        let params = new HttpParams();

        if (filter) {
            if (filter.projectId) params = params.set('projectId', filter.projectId.toString());
            if (filter.paymentType) params = params.set('paymentType', filter.paymentType);
            if (filter.status) params = params.set('status', filter.status);
            if (filter.paymentMethod) params = params.set('paymentMethod', filter.paymentMethod);
            if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom);
            if (filter.dateTo) params = params.set('dateTo', filter.dateTo);
            if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
            if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
            if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
            if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
            if (filter.sortDescending !== undefined) params = params.set('sortDescending', filter.sortDescending.toString());
        }

        return this.http.get<PagedClientPaymentResult>(this.apiUrl, { params });
    }

    /**
     * Get payments for a specific project
     */
    getPaymentsForProject(projectId: number, status?: string): Observable<ClientPaymentListItem[]> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);

        return this.http.get<ClientPaymentListItem[]>(`api/projects/${projectId}/client-payments`, { params });
    }

    /**
     * Get payment by ID
     */
    getPaymentById(paymentId: number): Observable<ClientPayment> {
        return this.http.get<ClientPayment>(`${this.apiUrl}/${paymentId}`);
    }

    /**
     * Create a new payment
     */
    createPayment(projectId: number, request: CreateClientPaymentRequest): Observable<{ paymentId: number; message: string }> {
        return this.http.post<{ paymentId: number; message: string }>(`api/projects/${projectId}/client-payments`, request);
    }

    /**
     * Update a payment
     */
    updatePayment(paymentId: number, request: UpdateClientPaymentRequest): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.apiUrl}/${paymentId}`, request);
    }

    /**
     * Delete a payment
     */
    deletePayment(paymentId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${paymentId}`);
    }

    // ==================== Payment Actions ====================

    /**
     * Confirm a pending payment
     */
    confirmPayment(paymentId: number, receiptNumber?: string, notes?: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/${paymentId}/confirm`, { receiptNumber, notes });
    }

    /**
     * Cancel a payment
     */
    cancelPayment(paymentId: number, reason?: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/${paymentId}/cancel`, { reason });
    }

    // ==================== Statistics ====================

    /**
     * Get payment statistics
     */
    getStatistics(projectId?: number): Observable<ClientPaymentStatistics> {
        let params = new HttpParams();
        if (projectId) params = params.set('projectId', projectId.toString());

        return this.http.get<ClientPaymentStatistics>(`${this.apiUrl}/statistics`, { params });
    }

    // ==================== Financial Summary ====================

    /**
     * Get financial summary for a project
     */
    getProjectFinancialSummary(projectId: number): Observable<ProjectFinancialSummary> {
        return this.http.get<ProjectFinancialSummary>(`api/projects/${projectId}/financial-summary`);
    }

    /**
     * Get financial summary for all company projects
     */
    getCompanyFinancialSummary(): Observable<ProjectFinancialSummary[]> {
        return this.http.get<ProjectFinancialSummary[]>(`api/company/financial-summary`);
    }
}
