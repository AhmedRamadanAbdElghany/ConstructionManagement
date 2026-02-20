import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Invoice Types
export type InvoiceType = 'DisbursementAuthorization' | 'PurchaseInvoice';

export interface InvoiceImageDto {
    id: number;
    imagePath: string;
    originalFileName?: string;
    fileSize?: number;
    contentType?: string;
    displayOrder: number;
    description?: string;
}

export interface InvoiceListItemDto {
    id: number;
    projectId: number;
    projectName: string;
    projectItemId: number;
    itemName: string;
    invoiceType: string;
    invoiceTypeDisplayName: string;
    invoiceNumber: string;
    invoiceDate: string;
    netAmount: number;
    currency: string;
    status: string;
    statusDisplayName: string;
    description?: string;
    imageCount: number;
    createdByFullName?: string;
    createdAt: string;
}

export interface InvoiceDto {
    id: number;
    projectId: number;
    projectName: string;
    projectItemId: number;
    itemName: string;
    invoiceType: string;
    invoiceTypeDisplayName: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate?: string;
    subTotal: number;
    taxRate?: number;
    taxAmount?: number;
    retentionRate?: number;
    retentionAmount?: number;
    netAmount: number;
    currency: string;
    description?: string;
    supplierVendor?: string;
    status: string;
    statusDisplayName: string;
    rejectionReason?: string;
    reviewDate?: string;
    reviewerFullName?: string;
    attachmentPath?: string;
    createdByUserId: number;
    createdByFullName?: string;
    createdAt: string;
    updatedAt?: string;
    images: InvoiceImageDto[];
}

export interface CreateInvoiceRequest {
    projectItemId: number;      // Required - The project item for this invoice
    netAmount: number;          // Required - Total invoice amount
    invoiceType?: InvoiceType | string;  // Optional - Default: PurchaseInvoice
    invoiceNumber?: string;     // Optional - Auto-generated if not provided
    invoiceDate?: string;       // Optional - Default: Current date
    dueDate?: string;           // Optional
    subTotal?: number;          // Optional - Default: Same as NetAmount
    taxRate?: number;           // Optional - Default: 0
    taxAmount?: number;         // Optional - Default: 0
    retentionRate?: number;     // Optional - Default: 0
    retentionAmount?: number;   // Optional - Default: 0
    currency?: string;          // Optional - Default: EGP
    description?: string;       // Optional
    supplierVendor?: string;    // Optional
    attachmentPath?: string;    // Optional
}

export interface UpdateInvoiceRequest {
    invoiceNumber?: string;
    invoiceDate?: string;
    dueDate?: string;
    subTotal?: number;
    taxRate?: number;
    taxAmount?: number;
    retentionRate?: number;
    retentionAmount?: number;
    netAmount?: number;
    currency?: string;
    description?: string;
    supplierVendor?: string;
    attachmentPath?: string;
}

export interface ReviewInvoiceRequest {
    isApproved: boolean;
    rejectionReason?: string;
}

export interface InvoiceFilterRequest {
    projectId?: number;
    projectItemId?: number;
    invoiceType?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    searchTerm?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}

export interface PagedInvoiceResult {
    items: InvoiceListItemDto[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface InvoiceStatisticsDto {
    totalInvoices: number;
    pendingInvoices: number;
    approvedInvoices: number;
    rejectedInvoices: number;
    totalAmount: number;
    pendingAmount: number;
    approvedAmount: number;
    disbursementAuthorizationCount: number;
    purchaseInvoiceCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class InvoicesService {
    private apiUrl = 'api/invoices';

    constructor(private http: HttpClient) { }

    // ==================== Invoice CRUD ====================

    /**
     * Create a new invoice for a project item
     */
    createInvoice(request: CreateInvoiceRequest): Observable<{ invoiceId: number; message: string }> {
        return this.http.post<{ invoiceId: number; message: string }>(this.apiUrl, request);
    }

    /**
     * Create invoice for a specific project item (alternative endpoint)
     */
    createInvoiceForItem(projectId: number, itemId: number, request: CreateInvoiceRequest): Observable<{ invoiceId: number; message: string }> {
        return this.http.post<{ invoiceId: number; message: string }>(`api/projects/${projectId}/items/${itemId}/invoices`, request);
    }

    /**
     * Get invoice by ID
     */
    getInvoiceById(invoiceId: number): Observable<InvoiceDto> {
        return this.http.get<InvoiceDto>(`${this.apiUrl}/${invoiceId}`);
    }

    /**
     * Update an existing invoice
     */
    updateInvoice(invoiceId: number, request: UpdateInvoiceRequest): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.apiUrl}/${invoiceId}`, request);
    }

    /**
     * Delete an invoice
     */
    deleteInvoice(invoiceId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${invoiceId}`);
    }

    // ==================== Invoice Listing ====================

    /**
     * Get all invoices with filtering and pagination
     */
    getInvoices(filter?: InvoiceFilterRequest): Observable<PagedInvoiceResult> {
        let params = new HttpParams();

        if (filter) {
            if (filter.projectId) params = params.set('projectId', filter.projectId.toString());
            if (filter.projectItemId) params = params.set('projectItemId', filter.projectItemId.toString());
            if (filter.invoiceType) params = params.set('invoiceType', filter.invoiceType);
            if (filter.status) params = params.set('status', filter.status);
            if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom);
            if (filter.dateTo) params = params.set('dateTo', filter.dateTo);
            if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
            if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
            if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
            if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
            if (filter.sortDescending !== undefined) params = params.set('sortDescending', filter.sortDescending.toString());
        }

        return this.http.get<PagedInvoiceResult>(this.apiUrl, { params });
    }

    /**
     * Get invoices for a specific project
     */
    getInvoicesForProject(projectId: number, type?: string, status?: string): Observable<InvoiceListItemDto[]> {
        let params = new HttpParams();
        if (type) params = params.set('type', type);
        if (status) params = params.set('status', status);

        return this.http.get<InvoiceListItemDto[]>(`api/projects/${projectId}/invoices`, { params });
    }

    /**
     * Get invoices for a specific project item
     */
    getInvoicesForItem(projectId: number, itemId: number): Observable<InvoiceListItemDto[]> {
        return this.http.get<InvoiceListItemDto[]>(`api/projects/${projectId}/items/${itemId}/invoices`);
    }

    /**
     * Get pending invoices for approval
     */
    getPendingInvoices(): Observable<InvoiceListItemDto[]> {
        return this.http.get<InvoiceListItemDto[]>(`${this.apiUrl}/pending`);
    }

    /**
     * Get invoice statistics
     */
    getStatistics(projectId?: number): Observable<InvoiceStatisticsDto> {
        let params = new HttpParams();
        if (projectId) params = params.set('projectId', projectId.toString());

        return this.http.get<InvoiceStatisticsDto>(`${this.apiUrl}/statistics`, { params });
    }

    // ==================== Invoice Review ====================

    /**
     * @deprecated Use createInvoiceForItem instead
     */
    createInvoiceLegacy(itemId: number, request: CreateInvoiceRequest): Observable<{ invoiceId: number }> {
        return this.http.post<{ invoiceId: number }>(`api/items/${itemId}/invoices`, request);
    }

    /**
     * @deprecated Use getInvoicesForItem instead
     */
    getInvoicesByItem(itemId: number): Observable<InvoiceDto[]> {
        return this.http.get<InvoiceDto[]>(`api/items/${itemId}/invoices`);
    }

    // ==================== Invoice Images ====================

    /**
     * Add an image to an invoice
     */
    addInvoiceImage(invoiceId: number, file: File, description?: string): Observable<{ imageId: number; message: string }> {
        const formData = new FormData();
        formData.append('file', file);
        if (description) formData.append('description', description);

        return this.http.post<{ imageId: number; message: string }>(`${this.apiUrl}/${invoiceId}/images`, formData);
    }

    /**
     * Remove an image from an invoice
     */
    removeInvoiceImage(invoiceId: number, imageId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${invoiceId}/images/${imageId}`);
    }

    /**
     * Reorder invoice images
     */
    reorderInvoiceImages(invoiceId: number, imageOrder: { [key: number]: number }): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.apiUrl}/${invoiceId}/images/reorder`, imageOrder);
    }

    /**
     * Review (approve/reject) an invoice
     */
    reviewInvoice(invoiceId: number, isApproved: boolean, rejectionReason?: string): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.apiUrl}/${invoiceId}/review`, { isApproved, rejectionReason });
    }
}
