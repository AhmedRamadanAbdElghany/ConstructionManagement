import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Payment Transaction DTOs
export interface PaymentTransactionDto {
    id: number;
    companyId: number;
    companyName: string;
    projectId?: number;
    projectName?: string;
    invoiceId?: number;
    invoiceNumber?: string;
    amount: number;
    currency: string;
    channel: 'Online' | 'Offline';
    paymentMethod: string;
    transactionReference?: string;
    status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    createdAt: Date;
    completedAt?: Date;
    recordedByName?: string;
    notes?: string;
    receiptUrl?: string;
}

export interface PaymentHistoryDto {
    transactions: PaymentTransactionDto[];
    totalCount: number;
    totalAmount: number;
    pendingAmount: number;
    completedAmount: number;
}

export interface PaymentSummaryDto {
    totalReceived: number;
    totalPending: number;
    totalRefunded: number;
    completedPayments: number;
    pendingPayments: number;
    failedPayments: number;
    recentPayments: RecentPaymentDto[];
}

export interface RecentPaymentDto {
    id: number;
    clientName: string;
    projectName?: string;
    amount: number;
    status: string;
    createdAt: Date;
}

export interface PaymentResultDto {
    success: boolean;
    message: string;
    transaction?: PaymentTransactionDto;
    clientSecret?: string;
}

export interface CreateOnlinePaymentRequest {
    projectId?: number;
    invoiceId?: number;
    amount: number;
    currency?: string;
    paymentMethod: string;
    notes?: string;
}

export interface RecordOfflinePaymentRequest {
    projectId?: number;
    invoiceId?: number;
    amount: number;
    currency?: string;
    paymentMethod: string;
    transactionReference?: string;
    paymentDate: Date;
    notes?: string;
    receiptUrl?: string;
}

export interface RefundPaymentRequest {
    transactionId: number;
    amount?: number;
    reason: string;
}

export interface PaymentSettingsDto {
    enableOnlinePayments: boolean;
    enableStripe: boolean;
    enablePayPal: boolean;
    enableBankTransfer: boolean;
    stripePublicKey?: string;
    currency: string;
    minimumPaymentAmount: number;
    requirePaymentApproval: boolean;
}

export interface UpdatePaymentSettingsRequest {
    enableOnlinePayments: boolean;
    enableStripe: boolean;
    enablePayPal: boolean;
    enableBankTransfer: boolean;
    // Note: Secret keys (stripeSecretKey, payPalClientSecret) should NEVER be sent to/from frontend
    // Use separate secure admin endpoints for credential management
    stripePublicKey?: string;
    payPalClientId?: string;
    currency: string;
    minimumPaymentAmount: number;
    requirePaymentApproval: boolean;
}

// Separate interface for admin credential updates - use with caution
export interface UpdatePaymentCredentialsRequest {
    stripeSecretKey?: string;
    payPalClientSecret?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = '/api/payments';

    constructor(private http: HttpClient) { }

    // Get payment transaction by ID
    getTransaction(id: number): Observable<PaymentTransactionDto> {
        return this.http.get<PaymentTransactionDto>(`${this.apiUrl}/${id}`)
            .pipe(catchError(this.handleError));
    }

    // Get payment history for company
    getPaymentHistory(projectId?: number, page: number = 1, pageSize: number = 20): Observable<PaymentHistoryDto> {
        const params: any = { page, pageSize };
        if (projectId) {
            params.projectId = projectId;
        }
        return this.http.get<PaymentHistoryDto>(`${this.apiUrl}/history`, { params })
            .pipe(catchError(this.handleError));
    }

    // Get payment summary for dashboard
    getPaymentSummary(): Observable<PaymentSummaryDto> {
        return this.http.get<PaymentSummaryDto>(`${this.apiUrl}/summary`)
            .pipe(catchError(this.handleError));
    }

    // Get payments for a specific project
    getProjectPayments(projectId: number): Observable<PaymentTransactionDto[]> {
        return this.http.get<PaymentTransactionDto[]>(`${this.apiUrl}/project/${projectId}`)
            .pipe(catchError(this.handleError));
    }

    // Initiate online payment (Client)
    initiatePayment(request: CreateOnlinePaymentRequest): Observable<PaymentResultDto> {
        return this.http.post<PaymentResultDto>(`${this.apiUrl}/initiate`, request)
            .pipe(catchError(this.handleError));
    }

    // Confirm online payment after gateway processing
    confirmPayment(transactionId: number, paymentIntentId: string): Observable<PaymentResultDto> {
        return this.http.post<PaymentResultDto>(`${this.apiUrl}/${transactionId}/confirm`, { paymentIntentId })
            .pipe(catchError(this.handleError));
    }

    // Record offline payment (Company Admin)
    recordOfflinePayment(request: RecordOfflinePaymentRequest): Observable<PaymentTransactionDto> {
        return this.http.post<PaymentTransactionDto>(`${this.apiUrl}/record-offline`, request)
            .pipe(catchError(this.handleError));
    }

    // Update payment status
    updatePaymentStatus(id: number, status: string, notes?: string): Observable<PaymentTransactionDto> {
        return this.http.put<PaymentTransactionDto>(`${this.apiUrl}/${id}/status`, { status, notes })
            .pipe(catchError(this.handleError));
    }

    // Refund a payment
    refundPayment(id: number, request: RefundPaymentRequest): Observable<PaymentResultDto> {
        return this.http.post<PaymentResultDto>(`${this.apiUrl}/${id}/refund`, request)
            .pipe(catchError(this.handleError));
    }

    // Get payment settings
    getPaymentSettings(): Observable<PaymentSettingsDto> {
        return this.http.get<PaymentSettingsDto>(`${this.apiUrl}/settings`)
            .pipe(catchError(this.handleError));
    }

    // Update payment settings
    updatePaymentSettings(request: UpdatePaymentSettingsRequest): Observable<PaymentSettingsDto> {
        return this.http.put<PaymentSettingsDto>(`${this.apiUrl}/settings`, request)
            .pipe(catchError(this.handleError));
    }

    // Get client payment history (for client portal)
    getClientPaymentHistory(): Observable<PaymentHistoryDto> {
        return this.http.get<PaymentHistoryDto>(`${this.apiUrl}/client-history`)
            .pipe(catchError(this.handleError));
    }

    // Centralized error handling
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            // Server-side error
            if (error.error?.message) {
                errorMessage = error.error.message;
            } else if (error.status === 0) {
                errorMessage = 'Unable to connect to the server. Please check your connection.';
            } else if (error.status === 401) {
                errorMessage = 'Session expired. Please log in again.';
            } else if (error.status === 403) {
                errorMessage = 'You do not have permission to perform this action.';
            } else if (error.status === 429) {
                errorMessage = 'Too many requests. Please try again later.';
            } else if (error.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else {
                errorMessage = `Error: ${error.status} - ${error.statusText}`;
            }
        }

        console.error('Payment Service Error:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
    }
}
