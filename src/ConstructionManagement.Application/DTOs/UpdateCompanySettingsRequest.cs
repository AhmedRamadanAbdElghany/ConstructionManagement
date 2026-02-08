namespace ConstructionManagement.Application.DTOs;

public class UpdateCompanySettingsRequest
{
    // All fields are nullable so partial updates are possible
    // (only send the fields you want to change)

    public bool? EnableDelayNotification { get; set; }
    public bool? DelayNotificationIsOneTimeOnly { get; set; }
    public int? DelayNotificationIntervalDays { get; set; }
    public bool? DelayNotificationSendEmail { get; set; }
    public int? DelayGracePeriodDays { get; set; }

    public bool? EnablePhotoUpload { get; set; }
    public bool? RequirePhotoReview { get; set; }
    public string? PhotoApproverRole { get; set; }

    public bool? EnableInvoiceReview { get; set; }
    public bool? EnableInvoiceAggregation { get; set; }

    public int? MaxPhotosPerUpload { get; set; }

    public bool? ClientCanSeeFinancials { get; set; }
    public bool? ClientCanSeeMedia { get; set; }
    public bool? ClientCanSeeBOQ { get; set; }
    
    public bool? AllowMeasured { get; set; }
    public bool? AllowSupervision { get; set; }
    public bool? AllowPackages { get; set; }
    
    public decimal? DefaultSupervisionPercentage { get; set; }

    public string? DefaultMoneyCalculationMethod { get; set; }

    // ============================================
    // INVENTORY MANAGEMENT SETTINGS
    // ============================================
    
    public bool? RequireMaterialRequestApproval { get; set; }
    public string? MaterialRequestApproverRole { get; set; }
    public bool? EnableMultiWarehouse { get; set; }
    public bool? EnableStockAlerts { get; set; }
    public decimal? DefaultLowStockThreshold { get; set; }

    // ============================================
    // EQUIPMENT MANAGEMENT SETTINGS
    // ============================================
    
    public bool? RequireEquipmentAssignmentApproval { get; set; }
    public string? EquipmentAssignmentApproverRole { get; set; }
    public bool? EnableEquipmentGpsTracking { get; set; }
    public bool? EnableEquipmentRentalBilling { get; set; }
    public bool? RequireMaintenanceSchedule { get; set; }
    public int? MaintenanceReminderDays { get; set; }
    public bool? EnableEquipmentUtilizationTracking { get; set; }
    public bool? EnableEquipmentInsuranceTracking { get; set; }
    public bool? EnableEquipmentDepreciation { get; set; }
    public int? DefaultDepreciationYears { get; set; }

    // ============================================
    // SAFETY MANAGEMENT SETTINGS
    // ============================================
    
    public bool? RequireSafetyInspections { get; set; }
    public int? SafetyInspectionFrequencyDays { get; set; }
    public int? IncidentReportingHours { get; set; }
    public bool? EnableIncidentEscalation { get; set; }
    public bool? RequireSafetyTraining { get; set; }
    public int? SafetyTrainingRenewalMonths { get; set; }
    public bool? RequireEquipmentOperatorCertification { get; set; }
    public bool? EnableSafetyComplianceTracking { get; set; }
    public string? SafetyChecklistApproverRole { get; set; }
    public string? IncidentInvestigatorRole { get; set; }

    // ============================================
    // SUBCONTRACTOR MANAGEMENT SETTINGS
    // ============================================
    
    public bool? RequireSubcontractorApproval { get; set; }
    public bool? RequireSubcontractorInsurance { get; set; }
    public int? SubcontractorInsuranceWarningDays { get; set; }
    public decimal? DefaultRetentionPercentage { get; set; }
    public bool? RequireSubcontractorContract { get; set; }
    public bool? RequireSubcontractorPaymentApproval { get; set; }
    public string? SubcontractorPaymentApproverRole { get; set; }
    public decimal? MaxPaymentWithoutApproval { get; set; }
    public bool? EnableSubcontractorRatings { get; set; }
    public bool? RequireRatingOnCompletion { get; set; }
    public bool? EnableSubcontractorSafetyScore { get; set; }
    public double? MinimumRatingThreshold { get; set; }

    // ============================================
    // DOCUMENT MANAGEMENT SETTINGS
    // ============================================
    
    public int? MaxFileSizeMB { get; set; }
    public string? AllowedFileTypes { get; set; }
    public bool? RequireDocumentApproval { get; set; }
    public bool? EnableVersionControl { get; set; }
    public bool? EnableExpirationTracking { get; set; }
    public int? DocumentExpirationWarningDays { get; set; }
    public string? DocumentApproverRole { get; set; }
    public bool? EnableDocumentCategories { get; set; }
    public int? MaxVersionsPerDocument { get; set; }
}
