import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SiteMediaDto {
    id: number;
    itemId?: number;
    itemName?: string;
    projectId: number;
    projectName?: string;
    mediaType: string;
    mediaTypeName: string;
    fileName: string;
    fileSize: number;
    fileUrl?: string;
    description?: string;
    status: string;
    statusName: string;
    uploadedDate: string;
    uploadedByUserId: number;
    uploadedByUserName?: string;
    approvedDate?: string;
    approvedByUserId?: number;
    approvedByUserName?: string;
    rejectionReason?: string;
    rejectionType?: string;
    sourceType?: string;
    companyId?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface UploadMediaRequest {
    itemId?: number;
    mediaType: string;
    description?: string;
    file: File;
    sourceType?: string;
}

export interface ReviewMediaRequest {
    status: string;
    rejectionReason?: string;
    rejectionType?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SiteMediaService {
    private apiUrl = 'api/projects';

    constructor(private http: HttpClient) { }

    // GET: api/projects/{projectId}/media
    getMediaForProject(projectId: number, itemId?: number, status?: string): Observable<SiteMediaDto[]> {
        let url = `${this.apiUrl}/${projectId}/media`;
        const params: string[] = [];
        if (itemId) params.push(`itemId=${itemId}`);
        if (status) params.push(`status=${status}`);
        if (params.length > 0) url += '?' + params.join('&');
        return this.http.get<SiteMediaDto[]>(url);
    }

    // GET: api/projects/{projectId}/media/{mediaId}
    getMediaById(mediaId: number): Observable<SiteMediaDto> {
        return this.http.get<SiteMediaDto>(`${this.apiUrl}/${mediaId}`);
    }

    // POST: api/projects/{projectId}/media
    uploadMedia(projectId: number, request: UploadMediaRequest): Observable<{ mediaId: number }> {
        const formData = new FormData();
        if (request.itemId) formData.append('itemId', request.itemId.toString());
        formData.append('mediaType', request.mediaType);
        if (request.description) formData.append('description', request.description);
        formData.append('file', request.file);
        if (request.sourceType) formData.append('sourceType', request.sourceType);
        return this.http.post<{ mediaId: number }>(`${this.apiUrl}/${projectId}/media`, formData);
    }

    // PUT: api/projects/{projectId}/media/{mediaId}/review
    reviewMedia(mediaId: number, request: ReviewMediaRequest): Observable<any> {
        return this.http.put(`${this.apiUrl}/${mediaId}/review`, request);
    }
}
