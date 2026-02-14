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
    latitude?: number;
    longitude?: number;
    isPublic: boolean;
    userId?: number;
}

export interface VendorProduct {
    id: number;
    vendorId: number;
    name: string;
    category?: string;
    price: number;
    unit?: string;
    description?: string;
    isActive: boolean;
}

export interface VendorSearchRequest {
    material?: string;
    name?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    projectId?: number;
}

export interface PublicVendor extends Vendor {
    distanceKm?: number;
    topProducts: VendorProduct[];
}

export interface VendorSpendReport {
    topVendors: VendorSpendItem[];
    spendTrends: SpendByDateItem[];
    totalSpend: number;
    totalInvoices: number;
}

export interface VendorSpendItem {
    vendorId: number;
    vendorName: string;
    totalAmount: number;
    invoiceCount: number;
}

export interface SpendByDateItem {
    date: string;
    amount: number;
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

export interface CreateVendorProductRequest {
    name: string;
    category?: string;
    price: number;
    unit?: string;
    description?: string;
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

    getInvoicesByProject(projectId: number): Observable<VendorInvoice[]> {
        return this.http.get<VendorInvoice[]>(`${this.baseUrl}/projects/${projectId}/invoices`);
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

    // Advanced Discovery & Analytics
    searchVendors(request: VendorSearchRequest): Observable<PublicVendor[]> {
        return this.http.get<PublicVendor[]>(`${this.baseUrl}/search`, { params: request as any });
    }

    getAnalytics(vendorId?: number, from?: string, to?: string): Observable<VendorSpendReport> {
        let params: any = {};
        if (vendorId) params.vendorId = vendorId;
        if (from) params.from = from;
        if (to) params.to = to;
        return this.http.get<VendorSpendReport>(`${this.baseUrl}/analytics`, { params });
    }

    // Product Management
    getVendorProducts(vendorId: number): Observable<VendorProduct[]> {
        return this.http.get<VendorProduct[]>(`${this.baseUrl}/${vendorId}/products`);
    }

    addProduct(vendorId: number, product: any): Observable<VendorProduct> {
        return this.http.post<VendorProduct>(`${this.baseUrl}/${vendorId}/products`, product);
    }

    deleteProduct(productId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/products/${productId}`);
    }

    // Profile Management
    getMyProfile(): Observable<Vendor> {
        return this.http.get<Vendor>(`${this.baseUrl}/profile`);
    }

    updateMyProfile(request: CreateVendorRequest): Observable<Vendor> {
        return this.http.put<Vendor>(`${this.baseUrl}/profile`, request);
    }
}
