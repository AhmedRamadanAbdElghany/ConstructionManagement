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
    [System.Text.Json.Serialization.JsonIgnore]
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
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Company Company { get; set; } = null!;


    // ============================================
    // MODULE MASTER SWITCHES (Controlled by Super Admin)
    // ============================================
    public bool EnableUserManagement { get; set; } = true;
    public bool EnableProjectManagement { get; set; } = true;
    public bool EnableProjectItemsManagement { get; set; } = true;
    public bool EnableDailyLogs { get; set; } = true;
    public bool EnableSiteMedia { get; set; } = true;
    public bool EnableInventoryManagement { get; set; } = false;
    public bool EnableEquipmentManagement { get; set; } = false;
    public bool EnableQualityControl { get; set; } = false;
    public bool EnableSafetyManagement { get; set; } = false;
    public bool EnableSubcontractorManagement { get; set; } = false;
    public bool EnableFinancialManagement { get; set; } = true;
    public bool EnableAnalytics { get; set; } = true;
    public bool EnableNotifications { get; set; } = true;
    public bool EnableDocumentManagement { get; set; } = false;
    public bool EnableDesignManagement { get; set; } = false;
    public bool EnableClientPortal { get; set; } = false;
    public bool EnableAccessControl { get; set; } = true;
    public bool EnableHRManagement { get; set; } = false;
    public bool EnableVendorManagement { get; set; } = false;

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
    public bool ClientCanSeeProjectItems { get; set; } = true;

    // Project Money Calculation Options
    public bool AllowMeasured { get; set; } = true;
    public bool AllowSupervision { get; set; } = true;
    public bool AllowPackages { get; set; } = false; // "Packages" calculation method
    public bool AllowLocations { get; set; } = true;
    public bool AllowHR { get; set; } = true;
        
    public decimal? DefaultSupervisionPercentage { get; set; }

    public ConstructionManagement.Domain.Enums.CalculationMethod DefaultMoneyCalculationMethod { get; set; } = ConstructionManagement.Domain.Enums.CalculationMethod.Measured;

    // Daily Log Settings
    public bool AllowAddProgressEntry { get; set; } = true;
    public bool AllowReopenClosedDay { get; set; } = false;
    public bool AutoCloseDay { get; set; } = false;
    public TimeSpan? AutoCloseDayTime { get; set; } // e.g., 18:00 (6 PM)

    // Vendor/Supplier Invoice Settings
    public bool EnableVendorInvoiceUpload { get; set; } = false;
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
    /// Master switch for maintenance scheduling
    /// </summary>
    public bool EnableEquipmentMaintenanceScheduling { get; set; } = true;
    
    /// <summary>
    /// Require maintenance schedule tracking
    /// </summary>
    public bool RequireMaintenanceSchedule { get; set; } = true;
    
    /// <summary>
    /// Default maintenance reminder days before due
    /// </summary>
    public int MaintenanceReminderDays { get; set; } = 7;
    public int EquipmentMaintenanceAlertThreshold { get; set; } = 50;
    
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

    // ============================================
    // QUALITY CONTROL SETTINGS
    // (Only configurable when EnableQualityControl is true)
    // ============================================
    
    public bool RequireQualityInspections { get; set; } = true;
    public int QualityInspectionFrequencyDays { get; set; } = 30;
    public bool DefectTrackingEnabled { get; set; } = true;
    public bool PunchListEnabled { get; set; } = true;
    public int QualityScoreThreshold { get; set; } = 80;
    public bool AutoEscalateCriticalDefects { get; set; } = true;
    public int DefectResponseHours { get; set; } = 48;

    // ============================================
    // ANALYTICS & REPORTING SETTINGS
    // (Only configurable when EnableAnalytics is true)
    // ============================================
    
    public bool EnableAnalyticsReporting { get; set; } = true;

    // ============================================
    // PAYMENT GATEWAY SETTINGS
    // (For online payment processing)
    // ============================================
    
    /// <summary>
    /// Enable online payment processing
    /// </summary>
    public bool EnableOnlinePayments { get; set; } = false;
    
    /// <summary>
    /// Enable Stripe payment gateway
    /// </summary>
    public bool EnableStripe { get; set; } = false;
    
    /// <summary>
    /// Enable PayPal payment gateway
    /// </summary>
    public bool EnablePayPal { get; set; } = false;
    
    /// <summary>
    /// Enable bank transfer payments
    /// </summary>
    public bool EnableBankTransfer { get; set; } = true;
    
    /// <summary>
    /// Stripe public key (for frontend - not sensitive, can be stored in plain text)
    /// </summary>
    public string? StripePublicKey { get; set; }
    
    /// <summary>
    /// Stripe secret key - ENCRYPTED storage. Use ISensitiveDataProtectionService to encrypt/decrypt.
    /// This field stores the encrypted value. Never store plain text API secrets.
    /// </summary>
    public string? StripeSecretKeyEncrypted { get; set; }
    
    /// <summary>
    /// PayPal client ID (not sensitive, can be stored in plain text)
    /// </summary>
    public string? PayPalClientId { get; set; }
    
    /// <summary>
    /// PayPal client secret - ENCRYPTED storage. Use ISensitiveDataProtectionService to encrypt/decrypt.
    /// This field stores the encrypted value. Never store plain text API secrets.
    /// </summary>
    public string? PayPalClientSecretEncrypted { get; set; }
    
    // Legacy properties for backward compatibility - these map to the encrypted versions
    // and will be removed in a future version. Use the *Encrypted properties directly.
    [Obsolete("Use StripeSecretKeyEncrypted instead. This property is for migration only.")]
    public string? StripeSecretKey 
    { 
        get => StripeSecretKeyEncrypted; 
        set => StripeSecretKeyEncrypted = value; 
    }
    
    [Obsolete("Use PayPalClientSecretEncrypted instead. This property is for migration only.")]
    public string? PayPalClientSecret 
    { 
        get => PayPalClientSecretEncrypted; 
        set => PayPalClientSecretEncrypted = value; 
    }
    
    /// <summary>
    /// Default currency for payments
    /// </summary>
    public string Currency { get; set; } = "USD";
    
    /// <summary>
    /// Minimum payment amount allowed
    /// </summary>
    public decimal MinimumPaymentAmount { get; set; } = 1;
    
    /// <summary>
    /// Require approval for recorded payments
    /// </summary>
    public bool RequirePaymentApproval { get; set; } = false;

    // You can add more global defaults here later
}
