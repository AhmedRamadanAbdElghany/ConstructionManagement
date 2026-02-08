import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TransactionDto {
    id: number;
    projectId: number;
    projectName?: string;
    boqItemId?: number;
    boqItemName?: string;
    transactionType: string;
    transactionTypeName: string;
    amount: number;
    description?: string;
    status: string;
    statusName: string;
    transactionDate: string;
    approvedDate?: string;
    approvedByUserId?: number;
    approvedByUserName?: string;
    rejectionReason?: string;
    companyId?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateTransactionRequest {
    boqItemId?: number;
    transactionType: string;
    amount: number;
    description?: string;
    transactionDate: string;
    file?: File;
}

export interface ReviewTransactionRequest {
    isApproved: boolean;
    rejectionReason?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TransactionsService {
    private apiUrl = 'api/projects';

    constructor(private http: HttpClient) { }

    // GET: api/projects/{projectId}/transactions
    getTransactions(projectId: number, boqItemId?: number): Observable<TransactionDto[]> {
        let url = `${this.apiUrl}/${projectId}/transactions`;
        if (boqItemId) {
            url += `?boqItemId=${boqItemId}`;
        }
        return this.http.get<TransactionDto[]>(url);
    }

    // GET: api/projects/{projectId}/transactions/{transactionId}
    getTransactionById(projectId: number, transactionId: number): Observable<TransactionDto> {
        return this.http.get<TransactionDto>(`${this.apiUrl}/${projectId}/transactions/${transactionId}`);
    }

    // POST: api/projects/{projectId}/transactions
    createTransaction(projectId: number, request: CreateTransactionRequest): Observable<{ transactionId: number }> {
        const formData = new FormData();
        formData.append('boqItemId', request.boqItemId?.toString() || '');
        formData.append('transactionType', request.transactionType);
        formData.append('amount', request.amount.toString());
        formData.append('description', request.description || '');
        formData.append('transactionDate', request.transactionDate);
        if (request.file) {
            formData.append('file', request.file);
        }
        return this.http.post<{ transactionId: number }>(`${this.apiUrl}/${projectId}/transactions`, formData);
    }

    // PUT: api/projects/{projectId}/transactions/{transactionId}/review
    reviewTransaction(projectId: number, transactionId: number, request: ReviewTransactionRequest): Observable<any> {
        return this.http.put(`${this.apiUrl}/${projectId}/transactions/${transactionId}/review`, request);
    }
}
