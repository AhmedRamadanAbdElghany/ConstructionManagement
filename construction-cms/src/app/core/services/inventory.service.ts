import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryItemDto {
    id: number;
    itemCode: string;
    itemName: string;
    description?: string;
    category?: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    location?: string;
    supplier?: string;
    minimumStock: number;
    maximumStock: number;
    reorderLevel: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateInventoryItemRequest {
    itemCode: string;
    itemName: string;
    description?: string;
    category?: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    location?: string;
    supplier?: string;
    minimumStock?: number;
    maximumStock?: number;
    reorderLevel?: number;
}

export interface UpdateInventoryItemRequest {
    itemName?: string;
    description?: string;
    category?: string;
    unit?: string;
    quantity?: number;
    unitPrice?: number;
    location?: string;
    supplier?: string;
    minimumStock?: number;
    maximumStock?: number;
    reorderLevel?: number;
    isActive?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private apiUrl = 'api/inventory';

    constructor(private http: HttpClient) { }

    // GET: api/inventory
    getInventoryItems(): Observable<InventoryItemDto[]> {
        return this.http.get<InventoryItemDto[]>(this.apiUrl);
    }

    // GET: api/inventory/5
    getInventoryItemById(id: number): Observable<InventoryItemDto> {
        return this.http.get<InventoryItemDto>(`${this.apiUrl}/${id}`);
    }

    // GET: api/inventory/category/{category}
    getInventoryByCategory(category: string): Observable<InventoryItemDto[]> {
        return this.http.get<InventoryItemDto[]>(`${this.apiUrl}/category/${category}`);
    }

    // GET: api/inventory/low-stock
    getLowStockItems(): Observable<InventoryItemDto[]> {
        return this.http.get<InventoryItemDto[]>(`${this.apiUrl}/low-stock`);
    }

    // POST: api/inventory
    createInventoryItem(request: CreateInventoryItemRequest): Observable<InventoryItemDto> {
        return this.http.post<InventoryItemDto>(this.apiUrl, request);
    }

    // PUT: api/inventory/5
    updateInventoryItem(id: number, request: UpdateInventoryItemRequest): Observable<InventoryItemDto> {
        return this.http.put<InventoryItemDto>(`${this.apiUrl}/${id}`, request);
    }

    // DELETE: api/inventory/5
    deleteInventoryItem(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
