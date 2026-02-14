using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public class CreateCompanyRequest
{
    public string Name { get; set; } = string.Empty;
    public int? PackageId { get; set; }
    
    public string AdminName { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = string.Empty;
    
    // Toggles for features
    public bool EnableDelayNotification { get; set; } = true;
    public bool EnablePhotoUpload { get; set; } = true;
    public bool RequirePhotoReview { get; set; } = true;
    public bool ClientCanSeeFinancials { get; set; } = false;

    // Toggles for Calculation Methods
    public bool AllowMeasured { get; set; } = true;
    public bool AllowSupervision { get; set; } = true;
    public bool AllowPackages { get; set; } = false;
    public bool AllowLocations { get; set; } = true;
    public bool AllowHR { get; set; } = true;

    // Feature Toggles
    public bool EnableUserManagement { get; set; } = true;
    public bool EnableProjectManagement { get; set; } = true;
    public bool EnableBOQManagement { get; set; } = true;
    public bool EnableDailyLogs { get; set; } = true;
    public bool EnableSiteMedia { get; set; } = true;
    public bool EnableEquipmentManagement { get; set; } = false;
    public bool EnableInventoryManagement { get; set; } = false;
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
    public bool EnableInvoiceReview { get; set; } = true;

    // Financial Governance
    public bool EnableVendorInvoiceUpload { get; set; }
    public string? InvoiceApproverRole { get; set; }
    public bool EnableCashVoucher { get; set; }
    public bool RequireCashVoucherApproval { get; set; }
    public string? CashVoucherApproverRole { get; set; }
    public string? CashVoucherSubmitterRole { get; set; }
    public bool RecordCashVoucherToWorker { get; set; }
}

public class UpdateCompanyRequest
{
    public string Name { get; set; } = string.Empty;
    public int? PackageId { get; set; }
    public bool IsActive { get; set; }

    // Toggles for features
    public bool EnableDelayNotification { get; set; }
    public bool EnablePhotoUpload { get; set; }
    public bool RequirePhotoReview { get; set; }
    public bool ClientCanSeeFinancials { get; set; }

    // Toggles for Calculation Methods
    public bool AllowMeasured { get; set; }
    public bool AllowSupervision { get; set; }
    public bool AllowPackages { get; set; }
    public bool AllowLocations { get; set; }
    public bool AllowHR { get; set; }

    // Inventory Configuration
    public bool RequireMaterialRequestApproval { get; set; }
    public string? MaterialRequestApproverRole { get; set; }
    public bool EnableMultiWarehouse { get; set; }
    public bool EnableStockAlerts { get; set; }
    public decimal? DefaultLowStockThreshold { get; set; }

    // Equipment Configuration
    public bool EnableEquipmentMaintenanceScheduling { get; set; }
    public bool EnableEquipmentUtilizationTracking { get; set; }
    public bool EnableEquipmentGpsTracking { get; set; }
    public bool EnableEquipmentRentalBilling { get; set; }
    public int EquipmentMaintenanceAlertThreshold { get; set; }

    // Daily Log Policy
    public bool AllowAddProgressEntry { get; set; }
    public bool AllowReopenClosedDay { get; set; }
    public bool AutoCloseDay { get; set; }

    // Reviews & Visibility
    public bool EnableInvoiceReview { get; set; }
    public bool ClientCanSeeMedia { get; set; }
    public bool ClientCanSeeBOQ { get; set; }

    // Feature Toggles (entity-level)
    public bool EnableUserManagement { get; set; }
    public bool EnableProjectManagement { get; set; }
    public bool EnableBOQManagement { get; set; }
    public bool EnableDailyLogs { get; set; }
    public bool EnableSiteMedia { get; set; }
    public bool EnableEquipmentManagement { get; set; }
    public bool EnableInventoryManagement { get; set; }
    public bool EnableQualityControl { get; set; }
    public bool EnableSafetyManagement { get; set; }
    public bool EnableSubcontractorManagement { get; set; }
    public bool EnableFinancialManagement { get; set; }
    public bool EnableAnalytics { get; set; }
    public bool EnableNotifications { get; set; }
    public bool EnableDocumentManagement { get; set; }
    public bool EnableDesignManagement { get; set; }
    public bool EnableClientPortal { get; set; }
    public bool EnableAccessControl { get; set; }
    public bool EnableHRManagement { get; set; }
    public bool EnableVendorManagement { get; set; }

    // Financial Governance
    public bool EnableVendorInvoiceUpload { get; set; }
    public string? InvoiceApproverRole { get; set; }
    public bool EnableCashVoucher { get; set; }
    public bool RequireCashVoucherApproval { get; set; }
    public string? CashVoucherApproverRole { get; set; }
    public string? CashVoucherSubmitterRole { get; set; }
    public bool RecordCashVoucherToWorker { get; set; }
}
