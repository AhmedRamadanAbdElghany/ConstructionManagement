import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CompanySettings, ProjectSettings } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private apiUrl = 'api'; // Usually proxy handles this or absolute URL is used

    // Dummy Data
    private dummyCompanySettings: CompanySettings = {
        enableDelayNotification: true,
        delayNotificationIsOneTimeOnly: false,
        delayNotificationIntervalDays: 7,
        delayNotificationSendEmail: true,
        delayGracePeriodDays: 3,
        enablePhotoUpload: true,
        requirePhotoReview: true,
        photoApproverRole: 'MediaReviewer',
        enableInvoiceReview: true,
        enableInvoiceAggregation: true,
        maxPhotosPerUpload: 10,
        clientCanSeeFinancials: false,
        clientCanSeeMedia: true,
        clientCanSeeBOQ: true,
        defaultMoneyCalculationMethod: 'Measured',
        allowMeasured: true,
        allowSupervision: true,
        allowPackages: true,
        defaultSupervisionPercentage: 10
    };

    private dummyProjectSettings: ProjectSettings = {
        enableDelayNotification: true,
        delayNotificationIsOneTimeOnly: false,
        delayNotificationIntervalDays: 7,
        delayNotificationSendEmail: true,
        delayGracePeriodDays: 3,
        enablePhotoUpload: true,
        requirePhotoReview: true,
        photoApproverRole: 'MediaReviewer',
        enableInvoiceReview: true,
        enableInvoiceAggregation: true,
        maxPhotosPerUpload: 10,
        clientCanSeeFinancials: false,
        clientCanSeeMedia: true,
        clientCanSeeBOQ: true,
        moneyCalculationMethod: 'Measured'
    };

    constructor(private http: HttpClient) { }

    getCompanySettings(): Observable<CompanySettings> {
        // Real API Call (Commented out)
        // return this.http.get<CompanySettings>(`${this.apiUrl}/company-settings`);

        return of(this.dummyCompanySettings);
    }

    updateCompanySettings(settings: Partial<CompanySettings>): Observable<CompanySettings> {
        // Real API Call (Commented out)
        // return this.http.put<CompanySettings>(`${this.apiUrl}/company-settings`, settings);

        this.dummyCompanySettings = { ...this.dummyCompanySettings, ...settings };
        return of(this.dummyCompanySettings);
    }

    getProjectSettings(projectId: number): Observable<ProjectSettings> {
        // Real API Call (Commented out)
        // return this.http.get<ProjectSettings>(`${this.apiUrl}/projects/${projectId}/settings`);

        return of(this.dummyProjectSettings);
    }

    updateProjectSettings(projectId: number, settings: Partial<ProjectSettings>): Observable<ProjectSettings> {
        // Real API Call (Commented out)
        // return this.http.put<ProjectSettings>(`${this.apiUrl}/projects/${projectId}/settings`, settings);

        this.dummyProjectSettings = { ...this.dummyProjectSettings, ...settings };
        return of(this.dummyProjectSettings);
    }
}
