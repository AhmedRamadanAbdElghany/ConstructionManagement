import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../../shared/interfaces';

export interface CreateCompanyRequest {
    name: string;
    packageId: number;
    adminName: string;
    adminEmail: string;
    allowMeasured: boolean;
    allowSupervision: boolean;
    allowPackages: boolean;
    enableDelayNotification: boolean;
    requirePhotoReview: boolean;
    enablePhotoUpload: boolean;
    clientCanSeeFinancials: boolean;
}

export interface UpdateCompanyRequest {
    name?: string;
    packageId?: number;
    isActive?: boolean;
    allowMeasured?: boolean;
    allowSupervision?: boolean;
    allowPackages?: boolean;
    enableDelayNotification?: boolean;
    requirePhotoReview?: boolean;
    enablePhotoUpload?: boolean;
    clientCanSeeFinancials?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CompaniesService {
    private apiUrl = 'api/admin/companies';

    constructor(private http: HttpClient) { }

    getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(this.apiUrl);
    }

    getCompany(id: number): Observable<Company> {
        return this.http.get<Company>(`${this.apiUrl}/${id}`);
    }

    createCompany(request: CreateCompanyRequest): Observable<Company> {
        return this.http.post<Company>(this.apiUrl, request);
    }

    updateCompany(id: number, request: UpdateCompanyRequest): Observable<Company> {
        return this.http.put<Company>(`${this.apiUrl}/${id}`, request);
    }

    deleteCompany(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
