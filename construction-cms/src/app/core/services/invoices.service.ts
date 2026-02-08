import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InvoiceDto {
    id: number;
    invoiceNumber: string;
    itemId: number;
    itemName?: string;
    amount: number;
    description?: string;
    status: string;
    statusName: string;
    invoiceDate: string;
    approvedDate?: string;
    approvedByUserId?: number;
    approvedByUserName?: string;
    rejectionReason?: string;
    companyId?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateInvoiceRequest {
    amount: number;
    description?: string;
    invoiceDate: string;
}

export interface ReviewInvoiceRequest {
    isApproved: boolean;
    rejectionReason?: string;
}

@Injectable({
    providedIn: 'root'
})
export class InvoicesService {
    private apiUrl = 'api/items';

    constructor(private http: HttpClient) { }

    // POST: api/items/{itemId}/invoices
    createInvoice(itemId: number, request: CreateInvoiceRequest): Observable<{ invoiceId: number }> {
        return this.http.post<{ invoiceId: number }>(`${this.apiUrl}/${itemId}/invoices`, request);
    }

    // GET: api/items/{itemId}/invoices/{invoiceId}
    getInvoiceById(itemId: number, invoiceId: number): Observable<InvoiceDto> {
        return this.http.get<InvoiceDto>(`${this.apiUrl}/${itemId}/invoices/${invoiceId}`);
    }

    // GET: api/invoices
    getInvoices(projectId?: number, status?: string): Observable<InvoiceDto[]> {
        let params = '';
        if (projectId !== undefined) {
            params += `?projectId=${projectId}`;
        }
        if (status !== undefined) {
            params += params ? `&status=${status}` : `?status=${status}`;
        }
        return this.http.get<InvoiceDto[]>(`api/invoices${params}`);
    }

    // PUT: api/items/{itemId}/invoices/{invoiceId}/review
    reviewInvoice(itemId: number, invoiceId: number, request: ReviewInvoiceRequest): Observable<any> {
        return this.http.put(`${this.apiUrl}/${itemId}/invoices/${invoiceId}/review`, request);
    }
}
