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

    // Feature Toggles
    enableUserManagement: boolean;
    enableProjectManagement: boolean;
    enableBOQManagement: boolean;
    enableDailyLogs: boolean;
    enableSiteMedia: boolean;
    enableEquipmentManagement: boolean;
    enableInventoryManagement: boolean;
    enableQualityControl: boolean;
    enableSafetyManagement: boolean;
    enableSubcontractorManagement: boolean;
    enableFinancialManagement: boolean;
    enableAnalytics: boolean;
    enableNotifications: boolean;
    enableDocumentManagement: boolean;
    enableDesignManagement: boolean;
    enableClientPortal: boolean;
    enableAccessControl: boolean;
    enableHRManagement: boolean;
    enableVendorManagement: boolean;
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

    // Feature Toggles
    enableUserManagement?: boolean;
    enableProjectManagement?: boolean;
    enableBOQManagement?: boolean;
    enableDailyLogs?: boolean;
    enableSiteMedia?: boolean;
    enableEquipmentManagement?: boolean;
    enableInventoryManagement?: boolean;
    enableQualityControl?: boolean;
    enableSafetyManagement?: boolean;
    enableSubcontractorManagement?: boolean;
    enableFinancialManagement?: boolean;
    enableAnalytics?: boolean;
    enableNotifications?: boolean;
    enableDocumentManagement?: boolean;
    enableDesignManagement?: boolean;
    enableClientPortal?: boolean;
    enableAccessControl?: boolean;
    enableHRManagement?: boolean;
    enableVendorManagement?: boolean;
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
