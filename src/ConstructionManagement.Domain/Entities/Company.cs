using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

public class Company : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? BusinessId { get; set; }
    
    /// <summary>
    /// Type of company: Construction or Warehouse
    /// </summary>
    public CompanyType Type { get; set; } = CompanyType.Construction;

    public string? LogoUrl { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Address { get; set; }
    
    // Geolocation for Warehouse
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    
    public bool IsActive { get; set; } = true;

    // Subscription
    public int? PackageId { get; set; }
    public virtual Package? Package { get; set; }
    
    // Relations
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<CompanyUser> CompanyUsers { get; set; } = new List<CompanyUser>();
    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
    public virtual ICollection<CompanyDefaultPhase> DefaultPhases { get; set; } = new List<CompanyDefaultPhase>();
    public virtual ICollection<CompanyDefaultDesignCategory> DefaultDesignCategories { get; set; } = new List<CompanyDefaultDesignCategory>();
    public virtual ICollection<CompanyDefaultDesign> DefaultDesigns { get; set; } = new List<CompanyDefaultDesign>();
    
    // 1:1 settings
    public virtual CompanySettings? Settings { get; set; }

    // Feature Toggles (legacy fallback defaults - CompanySettings is authoritative)
    public bool EnableUserManagement { get; set; } = true;
    public bool EnableProjectManagement { get; set; } = true;
    public bool EnableProjectItemsManagement { get; set; } = true;
    public bool EnableDailyLogs { get; set; } = true;
    public bool EnableSiteMedia { get; set; } = true;
    public bool EnableEquipmentManagement { get; set; } = true;
    public bool EnableInventoryManagement { get; set; } = true;
    public bool EnableQualityControl { get; set; } = true;
    public bool EnableSafetyManagement { get; set; } = true;
    public bool EnableSubcontractorManagement { get; set; } = true;
    public bool EnableFinancialManagement { get; set; } = true;
    public bool EnableAnalytics { get; set; } = true;
    public bool EnableNotifications { get; set; } = true;
    public bool EnableDocumentManagement { get; set; } = true;
    public bool EnableDesignManagement { get; set; } = true;
    public bool EnableClientPortal { get; set; } = true;
    public bool EnableAccessControl { get; set; } = true;
    public bool EnableHRManagement { get; set; } = true;
    public bool EnableVendorManagement { get; set; } = true;
    
    // Location & Geofencing Feature Flags (used when CompanySettings doesn't exist)
    public bool EnableLocationTracking { get; set; } = true;
    public bool EnableGeofenceManagement { get; set; } = true;
    public bool EnableLocationSubmit { get; set; } = true;

    // Additional Feature Flags (used when CompanySettings doesn't exist)
    public bool EnableInspections { get; set; } = true;
    public bool EnableLeaveManagement { get; set; } = true;
    public bool EnablePerformanceEvaluation { get; set; } = true;
    public bool EnableTrainingTracking { get; set; } = true;
    public bool EnableTasks { get; set; } = true;
    public bool EnableEscalations { get; set; } = true;
    public bool EnableMessaging { get; set; } = true;
    public bool EnableSocialWall { get; set; } = true;
    public bool EnableCurrencies { get; set; } = true;
    public bool EnablePaymentGateway { get; set; } = true;
    public bool EnableMarketplace { get; set; } = true;
    public bool EnableInventoryOwner { get; set; } = true;
    public bool EnableVideoCalls { get; set; } = true;
}
