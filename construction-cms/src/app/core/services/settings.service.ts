import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
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

    // Location & Geofencing Feature Flags
    enableLocationTracking?: boolean;
    enableGeofenceManagement?: boolean;
    enableLocationSubmit?: boolean;

    // Additional Feature Flags (default to false for security)
    enableInspections?: boolean;
    enableLeaveManagement?: boolean;
    enablePerformanceEvaluation?: boolean;
    enableTrainingTracking?: boolean;
    enableTasks?: boolean;
    enableEscalations?: boolean;
    enableMessaging?: boolean;
    enableSocialWall?: boolean;
    enableCurrencies?: boolean;
    enablePaymentGateway?: boolean;
    enableMarketplace?: boolean;
    enableInventoryOwner?: boolean;

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

    // Cache for company settings to enable feature flag checks
    private cachedSettings: CompanySettings | null = null;

    constructor(private http: HttpClient) { }

    // --- Company Settings ---

    getCompanySettings(): Observable<CompanySettings> {
        const user = this.authService.getCurrentUser();
        const isSuperAdmin = user?.roles?.includes('SuperAdmin');

        if (isSuperAdmin || !user?.companyId) {
            // Return default settings for SuperAdmins or users without a company
            const defaultSettings = {
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
                defaultSupervisionPercentage: 10,
                // New feature flags default to true for SuperAdmin
                enableInspections: true,
                enableTasks: true,
                enableEscalations: true,
                enableMessaging: true,
                enableLeaveManagement: true,
                enableLocationTracking: true,
                enableSocialWall: true
            } as CompanySettings;
            this.cachedSettings = defaultSettings;
            return of(defaultSettings);
        }

        return this.http.get<CompanySettings>(`${this.apiUrl}/company-settings`).pipe(
            tap(settings => {
                // Cache settings for feature flag checks
                this.cachedSettings = settings;
            })
        );
    }

    updateCompanySettings(request: UpdateCompanySettingsRequest): Observable<CompanySettings> {
        return this.http.put<CompanySettings>(`${this.apiUrl}/company-settings`, request).pipe(
            tap(settings => {
                // Update cache when settings are changed
                this.cachedSettings = settings;
            })
        );
    }

    // --- Project Settings ---

    getProjectSettings(projectId: number): Observable<ProjectSettings> {
        return this.http.get<ProjectSettings>(`${this.apiUrl}/projects/${projectId}/settings`);
    }

    updateProjectSettings(projectId: number, request: UpdateProjectSettingsRequest): Observable<ProjectSettings> {
        return this.http.put<ProjectSettings>(`${this.apiUrl}/projects/${projectId}/settings`, request);
    }

    // --- Feature Flag Helpers ---

    /**
     * Check if a specific feature is enabled for the current company
     * Uses cached settings to avoid repeated API calls
     * @param featureName The feature flag name (e.g., 'enableInspections', 'enableTasks')
     */
    isFeatureEnabled(featureName: string): boolean {
        if (!this.cachedSettings) {
            // Settings not loaded yet - assume enabled for backward compatibility
            // The actual check will happen after settings are loaded
            return true;
        }

        // Map camelCase to the property name in settings
        const settingsKey = featureName.charAt(0).toUpperCase() + featureName.slice(1);
        const propertyName = 'enable' + settingsKey.replace('enable', '');

        // Check if the property exists on settings
        const settings = this.cachedSettings as any;
        if (settings && typeof settings[featureName] === 'boolean') {
            return settings[featureName];
        }

        // Default to true for backward compatibility if property not found
        // This ensures existing functionality isn't broken
        return true;
    }

    /**
     * Check if Inspections feature is enabled
     */
    isInspectionsEnabled(): boolean {
        return this.isFeatureEnabled('enableInspections');
    }

    /**
     * Check if Tasks feature is enabled
     */
    isTasksEnabled(): boolean {
        return this.isFeatureEnabled('enableTasks');
    }

    /**
     * Check if Escalations feature is enabled
     */
    isEscalationsEnabled(): boolean {
        return this.isFeatureEnabled('enableEscalations');
    }

    /**
     * Check if Messaging feature is enabled
     */
    isMessagingEnabled(): boolean {
        return this.isFeatureEnabled('enableMessaging');
    }

    /**
     * Check if Leave Management feature is enabled
     */
    isLeaveManagementEnabled(): boolean {
        return this.isFeatureEnabled('enableLeaveManagement');
    }

    /**
     * Check if Location Tracking feature is enabled
     */
    isLocationTrackingEnabled(): boolean {
        return this.isFeatureEnabled('enableLocationTracking');
    }

    /**
     * Check if Social Wall feature is enabled
     */
    isSocialWallEnabled(): boolean {
        return this.isFeatureEnabled('enableSocialWall');
    }

    // --- Company Packages ---

    getCompanyPackages(): Observable<CompanyPackage[]> {
        // This endpoint might not exist in backend, returning empty array for now
        return this.http.get<CompanyPackage[]>(`${this.apiUrl}/companies/packages`);
    }
}
