import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Product Category Interfaces
export interface ProductCategory {
    id: number;
    name: string;
    nameAr: string;
    description?: string;
    icon?: string;
    parentCategoryId?: number;
    parentCategoryName?: string;
    isApproved: boolean;
    isSystemCategory: boolean;
    sortOrder: number;
    productCount: number;
    subCategories: ProductCategory[];
}

export interface ProductCategoryTree {
    id: number;
    name: string;
    nameAr: string;
    icon?: string;
    productCount: number;
    children: ProductCategoryTree[];
}

// Vendor/Product Interfaces
export interface MarketplaceProduct {
    id: number;
    vendorId: number;
    name: string;
    categoryId?: number;
    categoryName?: string;
    price: number;
    unit?: string;
    description?: string;
    quantityInStock: number;
    lowStockThreshold: number;
    purchasePrice: number;
    isActive: boolean;
    salesCount: number;
    imageUrl?: string;
    sku?: string;
    averageRating?: number;
    totalReviews: number;
}

export interface MarketplaceProductDetail extends MarketplaceProduct {
    vendorName: string;
    vendorLatitude?: number;
    vendorLongitude?: number;
    vendorAddress?: string;
}

export interface NearbyVendor {
    vendorId: number;
    companyName: string;
    description?: string;
    address?: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
    averageRating: number;
    totalReviews: number;
    totalOrders: number;
    productCount: number;
    categoryIds: number[];
}

export interface VendorProfile {
    id: number;
    companyName: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    averageRating: number;
    totalReviews: number;
    totalOrders: number;
    productCount: number;
    createdAt: Date;
}

export interface VendorStats {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    averageRating: number;
    totalReviews: number;
    totalRevenue: number;
    totalProducts: number;
}

export interface VendorReview {
    id: number;
    orderId: number;
    vendorId: number;
    customerId: number;
    customerName: string;
    rating: number;
    comment?: string;
    createdAt: Date;
}

// Order Interfaces
export interface MarketplaceOrder {
    id: number;
    orderNumber: string;
    customerId: number;
    customerName?: string;
    vendorId: number;
    vendorName?: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    orderDate: Date;
    expectedDeliveryDate?: Date;
    deliveredAt?: Date;
    subTotal: number;
    deliveryFee?: number;
    discountAmount?: number;
    totalAmount: number;
    deliveryAddress?: string;
    deliveryNotes?: string;
    notes?: string;
    items: MarketplaceOrderItem[];
}

export interface MarketplaceOrderItem {
    id: number;
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    unit?: string;
    totalPrice: number;
}

export interface CreateMarketplaceOrder {
    vendorId: number;
    items: CreateMarketplaceOrderItem[];
    deliveryAddress?: string;
    deliveryNotes?: string;
    notes?: string;
    paymentMethod: string;
    expectedDeliveryDate?: Date;
}

export interface CreateMarketplaceOrderItem {
    productId: number;
    quantity: number;
}

export interface CreateVendorReview {
    rating: number;
    comment?: string;
}

// Search/Filter Interfaces
export interface ProductSearchRequest {
    categoryId?: number;
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
    vendorId?: number;
    sortBy?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedResult<T> {
    items: T[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class MarketplaceService {
    private apiUrl = '/api/marketplace';

    constructor(private http: HttpClient) { }

    // Categories
    getCategories(): Observable<ProductCategory[]> {
        return this.http.get<ProductCategory[]>(`${this.apiUrl}/categories`);
    }

    getCategoryTree(): Observable<ProductCategoryTree[]> {
        return this.http.get<ProductCategoryTree[]>(`${this.apiUrl}/categories/tree`);
    }

    // Products
    searchProducts(request: ProductSearchRequest): Observable<PaginatedResult<MarketplaceProduct>> {
        let params = new HttpParams();
        if (request.categoryId) params = params.set('categoryId', request.categoryId.toString());
        if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
        if (request.minPrice) params = params.set('minPrice', request.minPrice.toString());
        if (request.maxPrice) params = params.set('maxPrice', request.maxPrice.toString());
        if (request.vendorId) params = params.set('vendorId', request.vendorId.toString());
        if (request.sortBy) params = params.set('sortBy', request.sortBy);
        if (request.page) params = params.set('page', request.page.toString());
        if (request.pageSize) params = params.set('pageSize', request.pageSize.toString());

        return this.http.get<PaginatedResult<MarketplaceProduct>>(`${this.apiUrl}/products`, { params });
    }

    getProduct(id: number): Observable<MarketplaceProductDetail> {
        return this.http.get<MarketplaceProductDetail>(`${this.apiUrl}/products/${id}`);
    }

    getProductsByCategory(categoryId: number, page: number = 1, pageSize: number = 20): Observable<PaginatedResult<MarketplaceProduct>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());
        return this.http.get<PaginatedResult<MarketplaceProduct>>(`${this.apiUrl}/categories/${categoryId}/products`, { params });
    }

    // Vendors
    getNearbyVendors(latitude: number, longitude: number, radiusKm: number = 10, categoryId?: number): Observable<NearbyVendor[]> {
        let params = new HttpParams()
            .set('latitude', latitude.toString())
            .set('longitude', longitude.toString())
            .set('radiusKm', radiusKm.toString());
        if (categoryId) params = params.set('categoryId', categoryId.toString());

        return this.http.get<NearbyVendor[]>(`${this.apiUrl}/vendors/nearby`, { params });
    }

    getVendorProfile(vendorId: number): Observable<VendorProfile> {
        return this.http.get<VendorProfile>(`${this.apiUrl}/vendors/${vendorId}`);
    }

    getVendorProducts(vendorId: number, categoryId?: number, page: number = 1, pageSize: number = 20): Observable<PaginatedResult<MarketplaceProduct>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());
        if (categoryId) params = params.set('categoryId', categoryId.toString());

        return this.http.get<PaginatedResult<MarketplaceProduct>>(`${this.apiUrl}/vendors/${vendorId}/products`, { params });
    }

    getVendorStats(vendorId: number): Observable<VendorStats> {
        return this.http.get<VendorStats>(`${this.apiUrl}/vendors/${vendorId}/stats`);
    }

    getVendorReviews(vendorId: number, page: number = 1, pageSize: number = 10): Observable<PaginatedResult<VendorReview>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());
        return this.http.get<PaginatedResult<VendorReview>>(`${this.apiUrl}/vendors/${vendorId}/reviews`, { params });
    }

    // Orders
    createOrder(order: CreateMarketplaceOrder): Observable<MarketplaceOrder> {
        return this.http.post<MarketplaceOrder>(`${this.apiUrl}/orders`, order);
    }

    getOrder(orderId: number): Observable<MarketplaceOrder> {
        return this.http.get<MarketplaceOrder>(`${this.apiUrl}/orders/${orderId}`);
    }

    getMyOrders(status?: string): Observable<MarketplaceOrder[]> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        return this.http.get<MarketplaceOrder[]>(`${this.apiUrl}/orders/my-orders`, { params });
    }

    getVendorOrders(status?: string): Observable<MarketplaceOrder[]> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        return this.http.get<MarketplaceOrder[]>(`${this.apiUrl}/orders/vendor-orders`, { params });
    }

    updateOrderStatus(orderId: number, status: string, notes?: string): Observable<MarketplaceOrder> {
        return this.http.put<MarketplaceOrder>(`${this.apiUrl}/orders/${orderId}/status`, { status, notes });
    }

    cancelOrder(orderId: number, reason?: string): Observable<MarketplaceOrder> {
        return this.http.post<MarketplaceOrder>(`${this.apiUrl}/orders/${orderId}/cancel`, { reason });
    }

    confirmDelivery(orderId: number): Observable<MarketplaceOrder> {
        return this.http.post<MarketplaceOrder>(`${this.apiUrl}/orders/${orderId}/confirm-delivery`, {});
    }

    // Reviews
    submitReview(orderId: number, review: CreateVendorReview): Observable<VendorReview> {
        return this.http.post<VendorReview>(`${this.apiUrl}/orders/${orderId}/review`, review);
    }

    getReview(reviewId: number): Observable<VendorReview> {
        return this.http.get<VendorReview>(`${this.apiUrl}/reviews/${reviewId}`);
    }
}
