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

    // Feature Toggles
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
}
