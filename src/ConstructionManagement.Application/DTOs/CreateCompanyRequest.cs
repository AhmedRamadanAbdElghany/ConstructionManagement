using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public class CreateCompanyRequest
{
    public string Name { get; set; } = string.Empty;
    public int? PackageId { get; set; }
    
    // Toggles for features
    public bool EnableDelayNotification { get; set; } = true;
    public bool EnablePhotoUpload { get; set; } = true;
    public bool RequirePhotoReview { get; set; } = true;
    public bool ClientCanSeeFinancials { get; set; } = false;

    // Toggles for Calculation Methods
    public bool AllowMeasured { get; set; } = true;
    public bool AllowSupervision { get; set; } = true;
    public bool AllowPackages { get; set; } = false;
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
}
