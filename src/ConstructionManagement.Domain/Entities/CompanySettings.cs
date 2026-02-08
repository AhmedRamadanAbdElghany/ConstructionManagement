using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Global company feature flags (Super Admin controls these)
/// </summary>
public class CompanyFeatureSettings : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Tenant identifier for data isolation
    /// </summary>
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company Company { get; set; } = null!;

    /// <summary>
    /// Master switch for Inventory Management module
    /// Only Super Admin can enable/disable this
    /// </summary>
    public bool EnableInventoryManagement { get; set; } = false;
    
    /// <summary>
    /// Master switch for Equipment Management module
    /// Only Super Admin can enable/disable this
    /// </summary>
    public bool EnableEquipmentManagement { get; set; } = false;
    
    /// <summary>
    /// Master switch for Safety Management module
    /// Only Super Admin can enable/disable this
    /// </summary>
    public bool EnableSafetyManagement { get; set; } = false;
    
    /// <summary>
    /// Master switch for Subcontractor Management module
    /// Only Super Admin can enable/disable this
    /// </summary>
    public bool EnableSubcontractorManagement { get; set; } = false;
    
    /// <summary>
    /// Master switch for Document Management module
    /// Only Super Admin can enable/disable this
    /// </summary>
    public bool EnableDocumentManagement { get; set; } = false;
}

/// <summary>
/// Company-specific configuration for Inventory module
/// Company Admin configures these when the module is enabled
/// </summary>
public class CompanySettings : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Tenant identifier for data isolation
    /// </summary>
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company Company { get; set; } = null!;

    // All the same settings as ProjectSettings
    public bool EnableDelayNotification { get; set; } = true;
    public bool DelayNotificationIsOneTimeOnly { get; set; } = false;
    public int DelayNotificationIntervalDays { get; set; } = 7;
    public bool DelayNotificationSendEmail { get; set; } = true;
    public int DelayGracePeriodDays { get; set; } = 3;

    public bool EnablePhotoUpload { get; set; } = true;
    public bool RequirePhotoReview { get; set; } = true;
    public string PhotoApproverRole { get; set; } = "MediaReviewer";

    public bool EnableInvoiceReview { get; set; } = true;
    public bool EnableInvoiceAggregation { get; set; } = true;

    public int? MaxPhotosPerUpload { get; set; } = 10;
        
    // Client Visibility Options
    public bool ClientCanSeeFinancials { get; set; } = false;
    public bool ClientCanSeeMedia { get; set; } = true;
    public bool ClientCanSeeBOQ { get; set; } = true;

    // Project Money Calculation Options
    public bool AllowMeasured { get; set; } = true;
    public bool AllowSupervision { get; set; } = true;
    public bool AllowPackages { get; set; } = false; // "Packages" calculation method
        
    public decimal? DefaultSupervisionPercentage { get; set; }

    public ConstructionManagement.Domain.Enums.CalculationMethod DefaultMoneyCalculationMethod { get; set; } = ConstructionManagement.Domain.Enums.CalculationMethod.Measured;

    // Daily Log Settings
    public bool AllowAddProgressEntry { get; set; } = true;
    public bool AllowReopenClosedDay { get; set; } = false;
    public bool AutoCloseDay { get; set; } = false;
    public TimeSpan? AutoCloseDayTime { get; set; } // e.g., 18:00 (6 PM)

    // Vendor/Supplier Invoice Settings
    public bool EnableVendorInvoiceUpload { get; set; } = false;
    public bool EnableVendorManagement { get; set; } = false;
    public bool RequireInvoiceApproval { get; set; } = true;
    public string? InvoiceApproverRole { get; set; } // Role required to approve invoices

    // Cash Voucher (ازن صرف) Settings
    public bool EnableCashVoucher { get; set; } = false;
    public bool RequireCashVoucherApproval { get; set; } = true;
    public string? CashVoucherApproverRole { get; set; } // Role required to approve cash vouchers
    public string? CashVoucherSubmitterRole { get; set; } // Role allowed to submit cash vouchers
    public bool RecordCashVoucherToWorker { get; set; } = true; // Link vouchers to worker profiles

    // Miscellaneous Expenses (نثريات) Settings
    public bool EnableMiscExpenses { get; set; } = false;
    public bool RequireMiscExpenseApproval { get; set; } = true;
    public string? MiscExpenseApproverRole { get; set; } // Role required to approve misc expenses

    // ============================================
    // INVENTORY MANAGEMENT SETTINGS
    // (Only configurable when EnableInventoryManagement is true)
    // ============================================
    
    /// <summary>
    /// Require approval for material requests
    /// </summary>
    public bool RequireMaterialRequestApproval { get; set; } = true;
    
    /// <summary>
    /// Role required to approve material requests
    /// </summary>
    public string? MaterialRequestApproverRole { get; set; }
    
    /// <summary>
    /// Enable multi-warehouse support
    /// </summary>
    public bool EnableMultiWarehouse { get; set; } = false;
    
    /// <summary>
    /// Enable low stock alerts/notifications
    /// </summary>
    public bool EnableStockAlerts { get; set; } = true;
    
    /// <summary>
    /// Default low stock threshold percentage
    /// </summary>
    public decimal? DefaultLowStockThreshold { get; set; }

    // ============================================
    // EQUIPMENT MANAGEMENT SETTINGS
    // (Only configurable when EnableEquipmentManagement is true)
    // ============================================
    
    /// <summary>
    /// Require approval for equipment assignments
    /// </summary>
    public bool RequireEquipmentAssignmentApproval { get; set; } = false;
    
    /// <summary>
    /// Role required to approve equipment assignments
    /// </summary>
    public string? EquipmentAssignmentApproverRole { get; set; }
    
    /// <summary>
    /// Enable equipment GPS tracking
    /// </summary>
    public bool EnableEquipmentGpsTracking { get; set; } = false;
    
    /// <summary>
    /// Enable equipment rental billing
    /// </summary>
    public bool EnableEquipmentRentalBilling { get; set; } = true;
    
    /// <summary>
    /// Require maintenance schedule tracking
    /// </summary>
    public bool RequireMaintenanceSchedule { get; set; } = true;
    
    /// <summary>
    /// Default maintenance reminder days before due
    /// </summary>
    public int MaintenanceReminderDays { get; set; } = 7;
    
    /// <summary>
    /// Enable equipment utilization tracking
    /// </summary>
    public bool EnableEquipmentUtilizationTracking { get; set; } = true;
    
    /// <summary>
    /// Enable equipment insurance tracking
    /// </summary>
    public bool EnableEquipmentInsuranceTracking { get; set; } = true;
    
    /// <summary>
    /// Enable equipment depreciation tracking
    /// </summary>
    public bool EnableEquipmentDepreciation { get; set; } = false;
    
    /// <summary>
    /// Default depreciation years for equipment
    /// </summary>
    public int? DefaultDepreciationYears { get; set; }

    // ============================================
    // SAFETY MANAGEMENT SETTINGS
    // (Only configurable when EnableSafetyManagement is true)
    // ============================================
    
    /// <summary>
    /// Master switch for Safety Management module
    /// Only Super Admin can enable/disable this
    /// </summary>
    public bool EnableSafetyManagement { get; set; } = false;
    
    /// <summary>
    /// Require safety inspections on all projects
    /// </summary>
    public bool RequireSafetyInspections { get; set; } = true;
    
    /// <summary>
    /// Frequency of safety inspections (in days)
    /// </summary>
    public int SafetyInspectionFrequencyDays { get; set; } = 14;
    
    /// <summary>
    /// Require incident reporting within specified hours
    /// </summary>
    public int IncidentReportingHours { get; set; } = 24;
    
    /// <summary>
    /// Enable automatic incident escalation
    /// </summary>
    public bool EnableIncidentEscalation { get; set; } = true;
    
    /// <summary>
    /// Require safety training for all workers
    /// </summary>
    public bool RequireSafetyTraining { get; set; } = true;
    
    /// <summary>
    /// Safety training renewal period (in months)
    /// </summary>
    public int SafetyTrainingRenewalMonths { get; set; } = 12;
    
    /// <summary>
    /// Require safety certifications for equipment operators
    /// </summary>
    public bool RequireEquipmentOperatorCertification { get; set; } = true;
    
    /// <summary>
    /// Enable safety compliance tracking
    /// </summary>
    public bool EnableSafetyComplianceTracking { get; set; } = true;
    
    /// <summary>
    /// Role required to approve safety checklists
    /// </summary>
    public string? SafetyChecklistApproverRole { get; set; }
    
    /// <summary>
    /// Role required to investigate incidents
    /// </summary>
    public string? IncidentInvestigatorRole { get; set; }

    // ============================================
    // SUBCONTRACTOR MANAGEMENT SETTINGS
    // (Only configurable when EnableSubcontractorManagement is true)
    // ============================================
    
    /// <summary>
    /// Require approval for new subcontractors
    /// </summary>
    public bool RequireSubcontractorApproval { get; set; } = true;
    
    /// <summary>
    /// Require insurance certificate for subcontractors
    /// </summary>
    public bool RequireSubcontractorInsurance { get; set; } = true;
    
    /// <summary>
    /// Insurance expiry warning days before expiry
    /// </summary>
    public int SubcontractorInsuranceWarningDays { get; set; } = 30;
    
    /// <summary>
    /// Default retention percentage for subcontractor payments
    /// </summary>
    public decimal? DefaultRetentionPercentage { get; set; } = 5;
    
    /// <summary>
    /// Require contract for subcontractor payments
    /// </summary>
    public bool RequireSubcontractorContract { get; set; } = true;
    
    /// <summary>
    /// Require approval for subcontractor payments
    /// </summary>
    public bool RequireSubcontractorPaymentApproval { get; set; } = true;
    
    /// <summary>
    /// Role required to approve subcontractor payments
    /// </summary>
    public string? SubcontractorPaymentApproverRole { get; set; }
    
    /// <summary>
    /// Maximum subcontractor payment without additional approval
    /// </summary>
    public decimal? MaxPaymentWithoutApproval { get; set; }
    
    /// <summary>
    /// Enable subcontractor performance ratings
    /// </summary>
    public bool EnableSubcontractorRatings { get; set; } = true;
    
    /// <summary>
    /// Require rating after contract completion
    /// </summary>
    public bool RequireRatingOnCompletion { get; set; } = false;
    
    /// <summary>
    /// Enable subcontractor safety score tracking
    /// </summary>
    public bool EnableSubcontractorSafetyScore { get; set; } = true;
    
    /// <summary>
    /// Minimum rating to be considered for future contracts
    /// </summary>
    public double? MinimumRatingThreshold { get; set; }

    // ============================================
    // DOCUMENT MANAGEMENT SETTINGS
    // (Only configurable when EnableDocumentManagement is true)
    // ============================================
    
    /// <summary>
    /// Maximum file size for uploads (in MB)
    /// </summary>
    public int? MaxFileSizeMB { get; set; } = 50;
    
    /// <summary>
    /// Allowed file types (comma-separated)
    /// </summary>
    public string? AllowedFileTypes { get; set; } = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.dwg,.dxf";
    
    /// <summary>
    /// Require approval for documents
    /// </summary>
    public bool RequireDocumentApproval { get; set; } = false;
    
    /// <summary>
    /// Enable document version control
    /// </summary>
    public bool EnableVersionControl { get; set; } = true;
    
    /// <summary>
    /// Enable expiration tracking
    /// </summary>
    public bool EnableExpirationTracking { get; set; } = true;
    
    /// <summary>
    /// Days before expiry to send warning
    /// </summary>
    public int DocumentExpirationWarningDays { get; set; } = 30;
    
    /// <summary>
    /// Role required to approve documents
    /// </summary>
    public string? DocumentApproverRole { get; set; }
    
    /// <summary>
    /// Enable document categories
    /// </summary>
    public bool EnableDocumentCategories { get; set; } = true;
    
    /// <summary>
    /// Maximum versions to keep per document (0 = unlimited)
    /// </summary>
    public int? MaxVersionsPerDocument { get; set; } = 0;

    // You can add more global defaults here later
}
