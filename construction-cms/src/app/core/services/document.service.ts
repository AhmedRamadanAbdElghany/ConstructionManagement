import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Document {
    id: number;
    categoryId?: number;
    categoryName?: string;
    projectId?: number;
    title: string;
    description?: string;
    documentType: string;
    tags?: string;
    fileName: string;
    fileSize: number;
    fileSizeFormatted: string;
    status: string;
    issueDate?: Date;
    expiryDate?: Date;
    isExpired: boolean;
    daysUntilExpiry?: number;
    currentVersion: number;
    uploadedBy: string;
    uploadedDate: Date;
    downloadCount: number;
    viewCount: number;
}

export interface DocumentCategory {
    id: number;
    name: string;
    description?: string;
    documentCount: number;
}

export interface DocumentSummary {
    totalDocuments: number;
    totalCategories: number;
    pendingApprovals: number;
    expiringDocuments: number;
    expiredDocuments: number;
    storageUsedFormatted: string;
}

export interface DocumentVersion {
    id: number;
    documentId: number;
    versionNumber: number;
    fileName: string;
    fileSize: number;
    uploadedBy: string;
    uploadedDate: Date;
    isCurrent: boolean;
    notes?: string;
}

export interface DocumentApproval {
    id: number;
    documentId: number;
    documentTitle: string;
    requestedBy: string;
    requestedDate: Date;
    status: string;
    reviewedBy?: string;
    reviewedDate?: Date;
    comments?: string;
}

export interface CreateDocumentRequest {
    title: string;
    description?: string;
    categoryId?: number;
    projectId?: number;
    documentType: string;
    tags?: string;
    file: File;
    expiryDate?: Date;
}

export interface UpdateDocumentRequest {
    title?: string;
    description?: string;
    categoryId?: number;
    projectId?: number;
    documentType?: string;
    tags?: string;
    file?: File;
    expiryDate?: Date;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
}

export interface UpdateCategoryRequest {
    name?: string;
    description?: string;
}

export interface DocumentSearchRequest {
    categoryId?: number;
    projectId?: number;
    documentType?: string;
    status?: string;
    search?: string;
}

export interface RequestApprovalRequest {
    approverId: number;
    notes?: string;
}

export interface SubmitApprovalRequest {
    approved: boolean;
    comments?: string;
}

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private apiUrl = 'api/document';

    constructor(private http: HttpClient) { }

    // --- Categories ---

    getCategories(): Observable<DocumentCategory[]> {
        return this.http.get<DocumentCategory[]>(`${this.apiUrl}/categories`);
    }

    getCategory(id: number): Observable<DocumentCategory> {
        return this.http.get<DocumentCategory>(`${this.apiUrl}/categories/${id}`);
    }

    createCategory(request: CreateCategoryRequest): Observable<DocumentCategory> {
        return this.http.post<DocumentCategory>(`${this.apiUrl}/categories`, request);
    }

    updateCategory(id: number, request: UpdateCategoryRequest): Observable<DocumentCategory> {
        return this.http.put<DocumentCategory>(`${this.apiUrl}/categories/${id}`, request);
    }

    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
    }

    // --- Documents ---

    getDocuments(request?: DocumentSearchRequest): Observable<Document[]> {
        const params = this.buildParams(request || {});
        return this.http.get<Document[]>(this.apiUrl, { params });
    }

    getSummary(): Observable<DocumentSummary> {
        return this.http.get<DocumentSummary>(`${this.apiUrl}/summary`);
    }

    searchDocuments(request: DocumentSearchRequest): Observable<Document[]> {
        const params = this.buildParams(request);
        return this.http.get<Document[]>(`${this.apiUrl}/search`, { params });
    }

    getExpiringDocuments(daysAhead: number = 30): Observable<Document[]> {
        return this.http.get<Document[]>(`${this.apiUrl}/expiring?daysAhead=${daysAhead}`);
    }

    getExpiredDocuments(): Observable<Document[]> {
        return this.http.get<Document[]>(`${this.apiUrl}/expired`);
    }

    getDocument(id: number): Observable<Document> {
        return this.http.get<Document>(`${this.apiUrl}/${id}`);
    }

    createDocument(request: CreateDocumentRequest): Observable<Document> {
        const formData = new FormData();
        formData.append('title', request.title);
        if (request.description) formData.append('description', request.description);
        if (request.categoryId) formData.append('categoryId', request.categoryId.toString());
        if (request.projectId) formData.append('projectId', request.projectId.toString());
        formData.append('documentType', request.documentType);
        if (request.tags) formData.append('tags', request.tags);
        formData.append('file', request.file);
        if (request.expiryDate) formData.append('expiryDate', request.expiryDate.toISOString());

        return this.http.post<Document>(this.apiUrl, formData);
    }

    updateDocument(id: number, request: UpdateDocumentRequest): Observable<Document> {
        const formData = new FormData();
        if (request.title) formData.append('title', request.title);
        if (request.description) formData.append('description', request.description);
        if (request.categoryId) formData.append('categoryId', request.categoryId.toString());
        if (request.projectId) formData.append('projectId', request.projectId.toString());
        if (request.documentType) formData.append('documentType', request.documentType);
        if (request.tags) formData.append('tags', request.tags);
        if (request.file) formData.append('file', request.file);
        if (request.expiryDate) formData.append('expiryDate', request.expiryDate.toISOString());

        return this.http.put<Document>(`${this.apiUrl}/${id}`, formData);
    }

    deleteDocument(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    archiveDocument(id: number): Observable<Document> {
        return this.http.post<Document>(`${this.apiUrl}/${id}/archive`, {});
    }

    restoreDocument(id: number): Observable<Document> {
        return this.http.post<Document>(`${this.apiUrl}/${id}/restore`, {});
    }

    // --- Versions ---

    getVersions(documentId: number): Observable<DocumentVersion[]> {
        return this.http.get<DocumentVersion[]>(`${this.apiUrl}/${documentId}/versions`);
    }

    uploadVersion(documentId: number, file: File, notes?: string): Observable<DocumentVersion> {
        const formData = new FormData();
        formData.append('file', file);
        if (notes) formData.append('notes', notes);

        return this.http.post<DocumentVersion>(`${this.apiUrl}/${documentId}/versions`, formData);
    }

    setCurrentVersion(documentId: number, versionId: number): Observable<DocumentVersion> {
        return this.http.put<DocumentVersion>(`${this.apiUrl}/${documentId}/versions/${versionId}/current`, {});
    }

    // --- Approvals ---

    getPendingApprovals(): Observable<DocumentApproval[]> {
        return this.http.get<DocumentApproval[]>(`${this.apiUrl}/approvals/pending`);
    }

    getDocumentApprovals(documentId: number): Observable<DocumentApproval[]> {
        return this.http.get<DocumentApproval[]>(`${this.apiUrl}/${documentId}/approvals`);
    }

    requestApproval(documentId: number, request: RequestApprovalRequest): Observable<Document> {
        return this.http.post<Document>(`${this.apiUrl}/${documentId}/request-approval`, request);
    }

    submitApproval(approvalId: number, request: SubmitApprovalRequest): Observable<DocumentApproval> {
        return this.http.post<DocumentApproval>(`${this.apiUrl}/approvals/${approvalId}/submit`, request);
    }

    cancelApproval(documentId: number): Observable<Document> {
        return this.http.post<Document>(`${this.apiUrl}/${documentId}/cancel-approval`, {});
    }

    // --- Downloads ---

    downloadDocument(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
    }

    downloadVersion(versionId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/versions/${versionId}/download`, { responseType: 'blob' });
    }

    // Helper function to build HttpParams
    private buildParams(params: { [key: string]: any }): HttpParams {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                httpParams = httpParams.set(key, params[key].toString());
            }
        });
        return httpParams;
    }
}
