import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vendor {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxNumber?: string;
    contactPerson?: string;
    notes?: string;
    vendorType?: string;
    currentBalance?: number;
    totalPaid?: number;
    totalInvoiced?: number;
    isActive: boolean;
    invoiceCount: number;
    createdAt: string;
}

export interface VendorInvoice {
    id: number;
    vendorId: number;
    vendorName: string;
    invoiceNumber: string;
    invoiceDate: string;
    amount: number;
    description?: string;
    notes?: string;
    fileUrl?: string;
    originalFileName?: string;
    materialType?: string;
    approvalStatus: string;
    approvedByUserId?: number;
    approvedByUserName?: string;
    approvedDate?: string;
    rejectionReason?: string;
    createdByUserId: number;
    createdByUserName: string;
    projectId?: number;
    projectName?: string;
    createdAt: string;
}

export interface VendorInvoiceSummary {
    vendorId: number;
    vendorName: string;
    totalInvoices: number;
    totalAmount: number;
    pendingApprovals: number;
    approvedCount: number;
    rejectedCount: number;
}

export interface CreateVendorRequest {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxNumber?: string;
    contactPerson?: string;
    notes?: string;
    vendorType?: string;
}

export interface CreateVendorInvoiceRequest {
    vendorId: number;
    invoiceNumber: string;
    invoiceDate: string;
    amount: number;
    description?: string;
    notes?: string;
    materialType?: string;
    projectId?: number;
    file?: File;
}

export interface ReviewVendorInvoiceRequest {
    isApproved: boolean;
    rejectionReason?: string;
}

@Injectable({
    providedIn: 'root'
})
export class VendorService {
    private baseUrl = '/api/vendors';

    constructor(private http: HttpClient) { }

    // Vendor operations
    getVendors(): Observable<Vendor[]> {
        return this.http.get<Vendor[]>(this.baseUrl);
    }

    getVendorById(id: number): Observable<Vendor> {
        return this.http.get<Vendor>(`${this.baseUrl}/${id}`);
    }

    createVendor(request: CreateVendorRequest): Observable<Vendor> {
        return this.http.post<Vendor>(this.baseUrl, request);
    }

    updateVendor(id: number, request: CreateVendorRequest): Observable<Vendor> {
        return this.http.put<Vendor>(`${this.baseUrl}/${id}`, request);
    }

    deleteVendor(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    // Invoice operations
    getInvoicesByVendor(vendorId: number): Observable<VendorInvoice[]> {
        return this.http.get<VendorInvoice[]>(`${this.baseUrl}/${vendorId}/invoices`);
    }

    getPendingInvoices(): Observable<VendorInvoice[]> {
        return this.http.get<VendorInvoice[]>(`${this.baseUrl}/invoices/pending`);
    }

    getInvoiceById(id: number): Observable<VendorInvoice> {
        return this.http.get<VendorInvoice>(`${this.baseUrl}/invoices/${id}`);
    }

    createInvoice(request: CreateVendorInvoiceRequest): Observable<VendorInvoice> {
        const formData = new FormData();
        formData.append('vendorId', request.vendorId.toString());
        formData.append('invoiceNumber', request.invoiceNumber);
        formData.append('invoiceDate', request.invoiceDate);
        formData.append('amount', request.amount.toString());
        if (request.description) formData.append('description', request.description);
        if (request.notes) formData.append('notes', request.notes);
        if (request.materialType) formData.append('materialType', request.materialType);
        if (request.projectId) formData.append('projectId', request.projectId.toString());
        if (request.file) formData.append('file', request.file);

        return this.http.post<VendorInvoice>(`${this.baseUrl}/invoices`, formData);
    }

    reviewInvoice(id: number, request: ReviewVendorInvoiceRequest): Observable<VendorInvoice> {
        return this.http.post<VendorInvoice>(`${this.baseUrl}/invoices/${id}/review`, request);
    }

    // Summary operations
    getVendorSummary(): Observable<VendorInvoiceSummary[]> {
        return this.http.get<VendorInvoiceSummary[]>(`${this.baseUrl}/summary`);
    }
}
