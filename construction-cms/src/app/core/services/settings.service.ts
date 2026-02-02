import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompanySettings, ProjectSettings, CompanyPackage } from '../../shared/interfaces';

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
        clientCanSeeFinancials: true,
        clientCanSeeMedia: true,
        clientCanSeeBOQ: true,
        defaultMoneyCalculationMethod: 'Measured',
        allowMeasured: true,
        allowSupervision: true,
        allowPackages: true,
        allowLocations: true,
        allowHR: true,
        defaultSupervisionPercentage: 10,
        allowAddProgressEntry: true,
        allowReopenClosedDay: true,
        autoCloseDay: true,
        autoCloseDayTime: '18:00'
    };

    private dummyCompanyPackages: CompanyPackage[] = [
        { id: 1, name: 'Basic Finish', description: 'Standard painting and flooring', price: 50000, includedItemsDescription: 'Walls, Tiles, Basic Plumbing', variationCalculation: 'AddFullCost' },
        { id: 2, name: 'Premium Luxury', description: 'Italian marble and smart home', price: 150000, includedItemsDescription: 'Marble, Smart Home, Custom Cabinetry', variationCalculation: 'AddDifference' }
    ];

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
        moneyCalculationMethod: 'Measured',
        allowAddProgressEntry: null,
        allowReopenClosedDay: null,
        autoCloseDay: null,
        autoCloseDayTime: null
    };

    private settingsSubject = new BehaviorSubject<CompanySettings>(this.dummyCompanySettings);

    constructor(private http: HttpClient) { }

    getCompanySettings(): Observable<CompanySettings> {
        // Return as observable and clone to prevent direct pollution
        return this.settingsSubject.asObservable().pipe(
            map(s => JSON.parse(JSON.stringify(s)))
        );
    }

    getCompanyPackages(): Observable<CompanyPackage[]> {
        return of([...this.dummyCompanyPackages]);
    }

    updateCompanySettings(settings: Partial<CompanySettings>): Observable<CompanySettings> {
        // In real app, this would be an API call
        const updated = { ...this.settingsSubject.value, ...settings };
        this.settingsSubject.next(updated);
        return of(updated);
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
