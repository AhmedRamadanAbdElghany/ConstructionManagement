import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyAnnouncement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '../models/announcement.model';

@Injectable({
    providedIn: 'root'
})
export class AnnouncementService {
    private apiUrl = 'api/CompanyAnnouncements';

    constructor(private http: HttpClient) { }

    getCompanyAnnouncements(companyId: number): Observable<CompanyAnnouncement[]> {
        return this.http.get<CompanyAnnouncement[]>(`${this.apiUrl}/company/${companyId}`);
    }

    getAnnouncement(id: number): Observable<CompanyAnnouncement> {
        return this.http.get<CompanyAnnouncement>(`${this.apiUrl}/${id}`);
    }

    isSubscribed(companyId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/company/${companyId}/subscribed`);
    }

    getSubscriberCount(companyId: number): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/company/${companyId}/subscribers`);
    }

    subscribe(companyId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/company/${companyId}/subscribe`, {});
    }

    unsubscribe(companyId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/company/${companyId}/subscribe`);
    }

    createAnnouncement(request: CreateAnnouncementRequest): Observable<number> {
        const formData = new FormData();
        formData.append('title', request.title);
        formData.append('content', request.content);
        formData.append('type', request.type);
        formData.append('isPublished', String(request.isPublished));
        if (request.image) {
            formData.append('image', request.image);
        }
        return this.http.post<number>(this.apiUrl, formData);
    }

    updateAnnouncement(id: number, request: UpdateAnnouncementRequest): Observable<void> {
        const formData = new FormData();
        if (request.title) formData.append('title', request.title);
        if (request.content) formData.append('content', request.content);
        if (request.type) formData.append('type', request.type);
        if (request.isPublished !== undefined) formData.append('isPublished', String(request.isPublished));
        if (request.image) formData.append('image', request.image);

        return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
    }

    deleteAnnouncement(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    uploadLogo(companyId: number, file: File): Observable<{ logoUrl: string }> {
        const formData = new FormData();
        formData.append('logo', file);
        // Using PublicCompanies endpoint for logo upload
        return this.http.post<{ logoUrl: string }>(`api/PublicCompanies/${companyId}/logo`, formData);
    }
}
