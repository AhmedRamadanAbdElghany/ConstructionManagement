import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PortfolioCategoryDto {
    id: number;
    companyId?: number;
    name: string;
    description?: string;
    order: number;
    parentCategoryId?: number;
    childCategories: PortfolioCategoryDto[];
    items: PortfolioItemDto[];
    itemCount: number;
}

export interface PortfolioItemDto {
    id: number;
    name: string;
    description?: string;
    categoryId?: number;
    categoryName?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    createdAt: string;
    completionDate?: string;
    clientName?: string;
    location?: string;
}

export interface CreatePortfolioCategoryRequest {
    name: string;
    description?: string;
    order?: number;
    parentCategoryId?: number;
}

export interface UpdatePortfolioCategoryRequest {
    name?: string;
    description?: string;
    order?: number;
    parentCategoryId?: number;
}

export interface CreatePortfolioItemRequest {
    name: string;
    description?: string;
    categoryId?: number;
    file?: File;
    completionDate?: string;
    clientName?: string;
    location?: string;
}

export interface UpdatePortfolioItemRequest {
    name?: string;
    description?: string;
    categoryId?: number;
    file?: File;
    completionDate?: string;
    clientName?: string;
    location?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PortfolioService {
    private baseUrl = '/api/Portfolios';

    constructor(private http: HttpClient) { }

    // Categories

    getCompanyPortfolio(companyId: number): Observable<PortfolioCategoryDto[]> {
        return this.http.get<PortfolioCategoryDto[]>(`${this.baseUrl}/company/${companyId}`);
    }

    getCategory(id: number): Observable<PortfolioCategoryDto> {
        return this.http.get<PortfolioCategoryDto>(`${this.baseUrl}/categories/${id}`);
    }

    createCategory(request: CreatePortfolioCategoryRequest): Observable<number> {
        return this.http.post<number>(`${this.baseUrl}/categories`, request);
    }

    updateCategory(id: number, request: UpdatePortfolioCategoryRequest): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/categories/${id}`, request);
    }

    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/categories/${id}`);
    }

    // Items

    getItem(id: number): Observable<PortfolioItemDto> {
        return this.http.get<PortfolioItemDto>(`${this.baseUrl}/items/${id}`);
    }

    createItem(request: CreatePortfolioItemRequest): Observable<number> {
        const formData = new FormData();
        formData.append('name', request.name);
        if (request.description) formData.append('description', request.description);
        if (request.categoryId) formData.append('categoryId', request.categoryId.toString());
        if (request.file) formData.append('file', request.file);
        if (request.completionDate) formData.append('completionDate', request.completionDate);
        if (request.clientName) formData.append('clientName', request.clientName);
        if (request.location) formData.append('location', request.location);

        return this.http.post<number>(`${this.baseUrl}/items`, formData);
    }

    updateItem(id: number, request: UpdatePortfolioItemRequest): Observable<void> {
        const formData = new FormData();
        if (request.name) formData.append('name', request.name);
        if (request.description) formData.append('description', request.description);
        if (request.categoryId) formData.append('categoryId', request.categoryId.toString());
        if (request.file) formData.append('file', request.file);
        if (request.completionDate) formData.append('completionDate', request.completionDate);
        if (request.clientName) formData.append('clientName', request.clientName);
        if (request.location) formData.append('location', request.location);

        return this.http.put<void>(`${this.baseUrl}/items/${id}`, formData);
    }

    deleteItem(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/items/${id}`);
    }

    // Helpers

    formatFileSize(bytes?: number): string {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
