namespace ConstructionManagement.Application.DTOs;

public record CompanyFeatureDto(
    bool EnableUserManagement,
    bool EnableProjectManagement,
    bool EnableBOQManagement,
    bool EnableDailyLogs,
    bool EnableSiteMedia,
    bool EnableEquipmentManagement,
    bool EnableInventoryManagement,
    bool EnableQualityControl,
    bool EnableSafetyManagement,
    bool EnableSubcontractorManagement,
    bool EnableFinancialManagement,
    bool EnableAnalytics,
    bool EnableNotifications,
    bool EnableDocumentManagement,
    bool EnableDesignManagement,
    bool EnableClientPortal,
    bool EnableAccessControl,
    bool EnableHRManagement,
    bool EnableVendorManagement
);
