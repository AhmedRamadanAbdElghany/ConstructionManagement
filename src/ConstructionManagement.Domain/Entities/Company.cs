using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

public class Company : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? BusinessId { get; set; }
    

    public string? LogoUrl { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Address { get; set; }
    
    public bool IsActive { get; set; } = true;

    // Subscription
    public int? PackageId { get; set; }
    public virtual Package? Package { get; set; }
    
    // Relations
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
    public virtual ICollection<CompanyDefaultPhase> DefaultPhases { get; set; } = new List<CompanyDefaultPhase>();
    
    // 1:1 settings
    public virtual CompanySettings? Settings { get; set; }
}
