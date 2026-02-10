import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateOrderRequest {
    warehouseOwnerId: number;
    projectId?: number;
    deliveryAddress: string;
    deliveryLatitude: number;
    deliveryLongitude: number;
    items: OrderItemRequest[];
    notes?: string;
}

export interface OrderItemRequest {
    itemName: string;
    quantity: number;
    unitPrice: number;
    unit?: string;
    description?: string;
}

export interface UpdateOrderStatusRequest {
    newStatus: number;
    notes?: string;
    latitude?: number;
    longitude?: number;
}

export interface WarehouseOrderItem {
    id: number;
    itemName: string;
    description?: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    totalPrice: number;
}

export interface OrderStatusHistory {
    id: number;
    previousStatus: number;
    newStatus: number;
    notes?: string;
    changedAt: Date;
    latitude?: number;
    longitude?: number;
}

export interface WarehouseOrderRequest {
    id: number;
    orderNumber: string;
    barcode: string;
    warehouseOwnerId: number;
    warehouseOwner?: any;
    projectId?: number;
    project?: any;
    status: number;
    deliveryAddress?: string;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    totalAmount: number;
    requestDate: Date;
    expectedDeliveryDate?: Date;
    deliveredAt?: Date;
    items: WarehouseOrderItem[];
    statusHistory: OrderStatusHistory[];
}

@Injectable({
    providedIn: 'root'
})
export class WarehouseOrderService {
    private apiUrl = '/api/warehouseorders';

    constructor(private http: HttpClient) { }

    createOrder(request: CreateOrderRequest): Observable<WarehouseOrderRequest> {
        return this.http.post<WarehouseOrderRequest>(this.apiUrl, request);
    }

    getOrderById(orderId: number): Observable<WarehouseOrderRequest> {
        return this.http.get<WarehouseOrderRequest>(`${this.apiUrl}/${orderId}`);
    }

    getOrderByBarcode(barcode: string): Observable<WarehouseOrderRequest> {
        return this.http.get<WarehouseOrderRequest>(`${this.apiUrl}/barcode/${barcode}`);
    }

    updateOrderStatus(orderId: number, request: UpdateOrderStatusRequest): Observable<WarehouseOrderRequest> {
        return this.http.put<WarehouseOrderRequest>(`${this.apiUrl}/${orderId}/status`, request);
    }

    getMyOrders(): Observable<WarehouseOrderRequest[]> {
        return this.http.get<WarehouseOrderRequest[]>(this.apiUrl);
    }
}
