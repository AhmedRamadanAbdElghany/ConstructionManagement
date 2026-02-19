namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Defines categories for leave (e.g., Annual, Sick, Emergency).
/// </summary>
public class LeaveType : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    /// <summary>
    /// Default number of days allowed per year.
    /// </summary>
    public int DefaultDays { get; set; } = 0;
    
    public bool IsPaid { get; set; } = true;
    public bool RequiresApproval { get; set; } = true;
}
