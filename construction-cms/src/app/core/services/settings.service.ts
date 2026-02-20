import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { CompanySettings, ProjectSettings, CompanyPackage } from '../../shared/interfaces';
import { AuthService } from './auth.service';

export interface UpdateCompanySettingsRequest {
    // Master Switches
    enableUserManagement?: boolean;
    enableProjectManagement?: boolean;
    enableProjectItemsManagement?: boolean;
    enableDailyLogs?: boolean;
    enableSiteMedia?: boolean;
    enableInventoryManagement?: boolean;
    enableEquipmentManagement?: boolean;
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

    enableDelayNotification?: boolean;
    delayNotificationIsOneTimeOnly?: boolean;
    delayNotificationIntervalDays?: number;
    delayNotificationSendEmail?: boolean;
    delayGracePeriodDays?: number;
    enablePhotoUpload?: boolean;
    requirePhotoReview?: boolean;
    photoApproverRole?: string;
    enableInvoiceReview?: boolean;
    enableInvoiceAggregation?: boolean;
    maxPhotosPerUpload?: number | null;
    clientCanSeeFinancials?: boolean;
    clientCanSeeMedia?: boolean;
    clientCanSeeProjectItems?: boolean;
    allowMeasured?: boolean;
    allowSupervision?: boolean;
    allowPackages?: boolean;
    defaultSupervisionPercentage?: number;
    requireMaterialRequestApproval?: boolean;
    materialRequestApproverRole?: string;
    enableMultiWarehouse?: boolean;
    enableStockAlerts?: boolean;
    defaultLowStockThreshold?: number;

    // Equipment Settings
    requireEquipmentAssignmentApproval?: boolean;
    equipmentAssignmentApproverRole?: string;
    enableEquipmentGpsTracking?: boolean;
    enableEquipmentRentalBilling?: boolean;
    requireMaintenanceSchedule?: boolean;
    maintenanceReminderDays?: number;
    enableEquipmentUtilizationTracking?: boolean;
    enableEquipmentInsuranceTracking?: boolean;
    enableEquipmentDepreciation?: boolean;
    defaultDepreciationYears?: number;

    // Safety Settings
    requireSafetyInspections?: boolean;
    safetyInspectionFrequencyDays?: number;
    incidentReportingHours?: number;
    enableIncidentEscalation?: boolean;
    requireSafetyTraining?: boolean;
    safetyTrainingRenewalMonths?: number;
    requireEquipmentOperatorCertification?: boolean;
    enableSafetyComplianceTracking?: boolean;
    safetyChecklistApproverRole?: string;
    incidentInvestigatorRole?: string;

    // Subcontractor Settings
    requireSubcontractorApproval?: boolean;
    requireSubcontractorInsurance?: boolean;
    subcontractorInsuranceWarningDays?: number;
    defaultRetentionPercentage?: number;
    requireSubcontractorContract?: boolean;
    requireSubcontractorPaymentApproval?: boolean;
    subcontractorPaymentApproverRole?: string;
    maxPaymentWithoutApproval?: number;
    enableSubcontractorRatings?: boolean;
    requireRatingOnCompletion?: boolean;
    enableSubcontractorSafetyScore?: boolean;
    minimumRatingThreshold?: number;

    // Document Settings
    maxFileSizeMB?: number;
    allowedFileTypes?: string;
    requireDocumentApproval?: boolean;
    enableVersionControl?: boolean;
    enableExpirationTracking?: boolean;
    documentExpirationWarningDays?: number;
    documentApproverRole?: string;
    enableDocumentCategories?: boolean;
    maxVersionsPerDocument?: number;

    // Quality Control Settings
    requireQualityInspections?: boolean;
    qualityInspectionFrequencyDays?: number;
    defectTrackingEnabled?: boolean;
    punchListEnabled?: boolean;
    qualityScoreThreshold?: number;
    autoEscalateCriticalDefects?: boolean;
    defectResponseHours?: number;

    // Analytics Settings
    enableAnalyticsReporting?: boolean;

    defaultMoneyCalculationMethod?: string;
}

export interface UpdateProjectSettingsRequest {
    enableDelayNotification?: boolean | null;
    delayNotificationIsOneTimeOnly?: boolean | null;
    delayNotificationIntervalDays?: number | null;
    delayNotificationSendEmail?: boolean | null;
    delayGracePeriodDays?: number | null;
    enablePhotoUpload?: boolean | null;
    requirePhotoReview?: boolean | null;
    photoApproverRole?: string | null;
    enableInvoiceReview?: boolean | null;
    enableInvoiceAggregation?: boolean | null;
    maxPhotosPerUpload?: number | null;
    clientCanSeeFinancials?: boolean | null;
    clientCanSeeMedia?: boolean | null;
    clientCanSeeProjectItems?: boolean | null;
    moneyCalculationMethod?: string | null;
    allowAddProgressEntry?: boolean | null;
    allowReopenClosedDay?: boolean | null;
    autoCloseDay?: boolean | null;
    autoCloseDayTime?: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private apiUrl = 'api';
    private authService = inject(AuthService);

    constructor(private http: HttpClient) { }

    // --- Company Settings ---

    getCompanySettings(): Observable<CompanySettings> {
        const user = this.authService.getCurrentUser();
        const isSuperAdmin = user?.roles?.includes('SuperAdmin');

        if (isSuperAdmin || !user?.companyId) {
            // Return default settings for SuperAdmins or users without a company
            return of({
                allowHR: true,
                allowLocations: true,
                enableInventoryManagement: true,
                enableEquipmentManagement: true,
                enableSafetyManagement: true,
                enableSubcontractorManagement: true,
                enableDocumentManagement: true,
                enableQualityControl: true,
                enableAnalyticsReporting: true,
                allowMeasured: true,
                allowSupervision: true,
                allowPackages: true,
                defaultSupervisionPercentage: 10
            } as CompanySettings);
        }

        return this.http.get<CompanySettings>(`${this.apiUrl}/company-settings`);
    }

    updateCompanySettings(request: UpdateCompanySettingsRequest): Observable<CompanySettings> {
        return this.http.put<CompanySettings>(`${this.apiUrl}/company-settings`, request);
    }

    // --- Project Settings ---

    getProjectSettings(projectId: number): Observable<ProjectSettings> {
        return this.http.get<ProjectSettings>(`${this.apiUrl}/projects/${projectId}/settings`);
    }

    updateProjectSettings(projectId: number, request: UpdateProjectSettingsRequest): Observable<ProjectSettings> {
        return this.http.put<ProjectSettings>(`${this.apiUrl}/projects/${projectId}/settings`, request);
    }

    // --- Company Packages ---

    getCompanyPackages(): Observable<CompanyPackage[]> {
        // This endpoint might not exist in backend, returning empty array for now
        return this.http.get<CompanyPackage[]>(`${this.apiUrl}/companies/packages`);
    }
}
