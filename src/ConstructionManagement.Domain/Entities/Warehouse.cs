using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a warehouse or storage location
/// </summary>
public class Warehouse : BaseEntity, ICompanyEntity
{
    public string Name { get; set; } = string.Empty;
    
    public string Code { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    /// <summary>
    /// Physical address
    /// </summary>
    public string? Address { get; set; }
    
    /// <summary>
    /// City
    /// </summary>
    public string? City { get; set; }
    
    /// <summary>
    /// Is this the default warehouse
    /// </summary>
    public bool IsDefault { get; set; } = false;
    
    /// <summary>
    /// Is warehouse active
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Manager responsible for this warehouse
    /// </summary>
    public int? ManagerUserId { get; set; }
    [ForeignKey(nameof(ManagerUserId))]
    public virtual User? ManagerUser { get; set; }
    
    /// <summary>
    /// Contact phone
    /// </summary>
    public string? Phone { get; set; }
    
    /// <summary>
    /// Contact email
    /// </summary>
    public string? Email { get; set; }
    
    /// <summary>
    /// Operating hours
    /// </summary>
    public string? OperatingHours { get; set; }
    
    /// <summary>
    /// Notes
    /// </summary>
    public string? Notes { get; set; }
    
    // Navigation Properties
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
    
    public virtual ICollection<MaterialStock> Stocks { get; set; }
        = new List<MaterialStock>();
}
