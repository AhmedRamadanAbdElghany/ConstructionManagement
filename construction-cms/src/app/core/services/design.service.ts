import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Design, DesignCategory, CreateDesignRequest, UpdateDesignRequest, CreateCategoryRequest, UpdateCategoryRequest } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class DesignService {
    private baseUrl = '/api';

    constructor(private http: HttpClient) { }

    // Design Operations

    getProjectDesigns(projectId: number): Observable<Design[]> {
        return this.http.get<Design[]>(`${this.baseUrl}/projects/${projectId}/designs`);
    }

    getProjectDesignsByCategory(projectId: number, categoryId?: number): Observable<Design[]> {
        const url = categoryId
            ? `${this.baseUrl}/projects/${projectId}/designs/category/${categoryId}`
            : `${this.baseUrl}/projects/${projectId}/designs`;
        return this.http.get<Design[]>(url);
    }

    getDesign(designId: number): Observable<Design> {
        return this.http.get<Design>(`${this.baseUrl}/designs/${designId}`);
    }

    createDesign(projectId: number, request: CreateDesignRequest): Observable<number> {
        const formData = new FormData();
        formData.append('name', request.name);
        if (request.description) formData.append('description', request.description);
        if (request.categoryId) formData.append('categoryId', request.categoryId.toString());
        if (request.file) formData.append('file', request.file);
        formData.append('status', request.status);
        formData.append('createAsNewVersion', request.createAsNewVersion.toString());
        if (request.parentDesignId) formData.append('parentDesignId', request.parentDesignId.toString());
        if (request.changeNotes) formData.append('changeNotes', request.changeNotes);

        return this.http.post<number>(`${this.baseUrl}/projects/${projectId}/designs`, formData);
    }

    updateDesign(designId: number, request: UpdateDesignRequest): Observable<void> {
        const formData = new FormData();
        if (request.name) formData.append('name', request.name);
        if (request.description) formData.append('description', request.description);
        if (request.categoryId) formData.append('categoryId', request.categoryId.toString());
        if (request.status) formData.append('status', request.status);
        if (request.file) formData.append('file', request.file);
        if (request.changeNotes) formData.append('changeNotes', request.changeNotes);

        return this.http.put<void>(`${this.baseUrl}/designs/${designId}`, formData);
    }

    deleteDesign(designId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/designs/${designId}`);
    }

    getDesignVersions(designId: number): Observable<Design[]> {
        return this.http.get<Design[]>(`${this.baseUrl}/designs/${designId}/versions`);
    }

    // Category Operations

    getCategoryTree(projectId: number): Observable<DesignCategory[]> {
        return this.http.get<DesignCategory[]>(`${this.baseUrl}/projects/${projectId}/designs/categories/tree`);
    }

    getProjectCategories(projectId: number): Observable<DesignCategory[]> {
        return this.http.get<DesignCategory[]>(`${this.baseUrl}/projects/${projectId}/designs/categories`);
    }

    getCategory(categoryId: number): Observable<DesignCategory> {
        return this.http.get<DesignCategory>(`${this.baseUrl}/designs/categories/${categoryId}`);
    }

    createCategory(projectId: number, request: CreateCategoryRequest): Observable<number> {
        const formData = new FormData();
        formData.append('name', request.name);
        formData.append('order', request.order.toString());
        if (request.description) formData.append('description', request.description);
        if (request.parentCategoryId) formData.append('parentCategoryId', request.parentCategoryId.toString());
        if (request.file) formData.append('file', request.file);

        return this.http.post<number>(`${this.baseUrl}/projects/${projectId}/designs/categories`, formData);
    }

    updateCategory(categoryId: number, request: UpdateCategoryRequest): Observable<void> {
        const formData = new FormData();
        if (request.name) formData.append('name', request.name);
        if (request.description) formData.append('description', request.description);
        if (request.parentCategoryId) formData.append('parentCategoryId', request.parentCategoryId.toString());
        if (request.order !== undefined) formData.append('order', request.order.toString());
        if (request.file) formData.append('file', request.file);

        return this.http.put<void>(`${this.baseUrl}/designs/categories/${categoryId}`, formData);
    }

    deleteCategory(categoryId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/designs/categories/${categoryId}`);
    }

    // Template Operations

    getCompanyTemplates(companyId: number): Observable<DesignCategory[]> {
        return this.http.get<DesignCategory[]>(`${this.baseUrl}/companies/${companyId}/design-templates`);
    }

    importTemplate(projectId: number, templateId: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/projects/${projectId}/designs/templates/${templateId}/import`, {});
    }

    // Utility Methods

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileIcon(fileType?: string): string {
        if (!fileType) return 'file';
        if (fileType.includes('pdf')) return 'pdf';
        if (fileType.includes('image')) return 'image';
        if (fileType.includes('cad') || fileType.includes('dxf') || fileType.includes('dwg')) return 'cad';
        return 'file';
    }
}
