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
    isExternalVendor?: boolean;
    externalVendorSource?: string;
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
    quantityInStock: number;
    lowStockThreshold: number;
    purchasePrice: number;
    salesCount?: number;
}

export interface VendorTransaction {
    id: number;
    vendorId: number;
    vendorProductId: number;
    productName: string;
    transactionType: 'Sale' | 'Purchase' | 'Adjustment' | 'InitialStock' | 'Return' | 'Loss';
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    transactionDate: string;
    notes?: string;
    referenceNumber?: string;
}

export interface VendorStats {
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    totalProducts: number;
    lowStockCount: number;
    pendingOrders: number;
    recentTransactions: VendorTransaction[];
}

export interface CreateVendorTransactionRequest {
    vendorProductId: number;
    transactionType: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
    referenceNumber?: string;
}

export interface UpdateVendorProductRequest {
    name?: string;
    category?: string;
    price?: number;
    unit?: string;
    description?: string;
    quantityInStock?: number;
    lowStockThreshold?: number;
    purchasePrice?: number;
    isActive?: boolean;
}

export interface UpdateLocationRequest {
    latitude: number;
    longitude: number;
}

export interface VendorSearchRequest {
    material?: string;
    name?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    projectId?: number;
}

// Feature 1: Vendor Dashboard Types
export interface VendorWithStats extends Vendor {
    totalInvoices: number;
    totalAmount: number;
    pendingAmount: number;
    approvedAmount: number;
    projectCount: number;
    lastInvoiceDate?: string;
}

export interface VendorProject {
    projectId: number;
    projectName: string;
    totalInvoices: number;
    totalAmount: number;
    pendingAmount: number;
    approvedAmount: number;
    lastInvoiceDate?: string;
    firstInvoiceDate?: string;
}

export interface VendorDashboard {
    totalVendors: number;
    externalVendors: number;
    registeredVendors: number;
    totalSpend: number;
    pendingApprovals: number;
    topVendors: VendorWithStats[];
    recentVendors: VendorWithStats[];
}

// Feature 2: Delivery Cost Tiers Types
export interface DeliveryCostTier {
    id: number;
    vendorProductId: number;
    productName: string;
    minWeightKg: number;
    maxWeightKg: number;
    pricePerKm: number;
    fixedFee: number;
    isActive: boolean;
    description?: string;
    createdAt: string;
}

export interface CreateDeliveryCostTierRequest {
    vendorProductId: number;
    minWeightKg: number;
    maxWeightKg: number;
    pricePerKm: number;
    fixedFee?: number;
    description?: string;
}

export interface UpdateDeliveryCostTierRequest {
    minWeightKg: number;
    maxWeightKg: number;
    pricePerKm: number;
    fixedFee: number;
    isActive: boolean;
    description?: string;
}

export interface DeliveryCalculationRequest {
    productId: number;
    weightKg: number;
    distanceKm: number;
}

export interface DeliveryCalculationResult {
    productId: number;
    productName: string;
    weightKg: number;
    distanceKm: number;
    appliedTierId?: number;
    appliedTierDescription?: string;
    pricePerKm: number;
    fixedFee: number;
    distanceCost: number;
    totalDeliveryCost: number;
    isCalculated: boolean;
    errorMessage?: string;
}

export interface BulkDeliveryCalculationRequest {
    items: DeliveryCalculationRequest[];
}

export interface BulkDeliveryCalculationResult {
    results: DeliveryCalculationResult[];
    totalDeliveryCost: number;
    allCalculated: boolean;
}

export interface PublicVendor extends Vendor {
    distanceKm?: number;
    topProducts: VendorProduct[];
    isRegistered: boolean;
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
    vendorId?: number;
    vendorName: string;
    externalVendorName?: string;
    isExternalVendor: boolean;
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
    quantityInStock?: number;
    lowStockThreshold?: number;
    purchasePrice?: number;
}

export interface CreateVendorInvoiceRequest {
    vendorId?: number;
    newVendorName?: string;
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
        if (request.vendorId) {
            formData.append('vendorId', request.vendorId.toString());
        } else if (request.newVendorName) {
            formData.append('newVendorName', request.newVendorName);
        }
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

    // Inventory Owner specific methods
    getMyProducts(): Observable<VendorProduct[]> {
        return this.http.get<VendorProduct[]>(`${this.baseUrl}/my-products`);
    }

    addMyProduct(product: CreateVendorProductRequest): Observable<VendorProduct> {
        return this.http.post<VendorProduct>(`${this.baseUrl}/my-products`, product);
    }

    updateMyProduct(id: number, product: UpdateVendorProductRequest): Observable<VendorProduct> {
        return this.http.put<VendorProduct>(`${this.baseUrl}/my-products/${id}`, product);
    }

    recordTransaction(request: CreateVendorTransactionRequest): Observable<VendorTransaction> {
        return this.http.post<VendorTransaction>(`${this.baseUrl}/record-transaction`, request);
    }

    getMyTransactions(): Observable<VendorTransaction[]> {
        return this.http.get<VendorTransaction[]>(`${this.baseUrl}/my-transactions`);
    }

    getMyOrders(): Observable<VendorInvoice[]> {
        return this.http.get<VendorInvoice[]>(`${this.baseUrl}/my-orders`);
    }

    getMyStats(): Observable<VendorStats> {
        return this.http.get<VendorStats>(`${this.baseUrl}/my-stats`);
    }

    updateLocation(latitude: number, longitude: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/my-location`, { latitude, longitude });
    }

    toggleVisibility(): Observable<Vendor> {
        return this.http.patch<Vendor>(`${this.baseUrl}/my-visibility`, {});
    }

    // Feature 1: Vendor Dashboard & Statistics
    getVendorsWithStats(): Observable<VendorWithStats[]> {
        return this.http.get<VendorWithStats[]>(`${this.baseUrl}/with-stats`);
    }

    getVendorDashboard(): Observable<VendorDashboard> {
        return this.http.get<VendorDashboard>(`${this.baseUrl}/dashboard`);
    }

    getVendorProjects(vendorId: number): Observable<VendorProject[]> {
        return this.http.get<VendorProject[]>(`${this.baseUrl}/${vendorId}/projects`);
    }

    getVendorBills(vendorId: number): Observable<VendorInvoice[]> {
        return this.http.get<VendorInvoice[]>(`${this.baseUrl}/${vendorId}/bills`);
    }

    getFinancialLedger(): Observable<VendorInvoice[]> {
        return this.http.get<VendorInvoice[]>(`${this.baseUrl}/financial-ledger`);
    }

    // Feature 2: Delivery Cost Tiers
    getDeliveryCostTiers(productId: number): Observable<DeliveryCostTier[]> {
        return this.http.get<DeliveryCostTier[]>(`${this.baseUrl}/products/${productId}/delivery-tiers`);
    }

    createDeliveryCostTier(productId: number, request: CreateDeliveryCostTierRequest): Observable<DeliveryCostTier> {
        return this.http.post<DeliveryCostTier>(`${this.baseUrl}/products/${productId}/delivery-tiers`, request);
    }

    updateDeliveryCostTier(tierId: number, request: UpdateDeliveryCostTierRequest): Observable<DeliveryCostTier> {
        return this.http.put<DeliveryCostTier>(`${this.baseUrl}/delivery-tiers/${tierId}`, request);
    }

    deleteDeliveryCostTier(tierId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/delivery-tiers/${tierId}`);
    }

    calculateDeliveryCost(request: DeliveryCalculationRequest): Observable<DeliveryCalculationResult> {
        return this.http.post<DeliveryCalculationResult>(`${this.baseUrl}/calculate-delivery`, request);
    }

    calculateBulkDeliveryCost(request: BulkDeliveryCalculationRequest): Observable<BulkDeliveryCalculationResult> {
        return this.http.post<BulkDeliveryCalculationResult>(`${this.baseUrl}/calculate-delivery/bulk`, request);
    }
}
