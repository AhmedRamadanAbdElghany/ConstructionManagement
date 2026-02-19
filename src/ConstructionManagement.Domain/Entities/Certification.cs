using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a certification, license, or diploma held by an employee.
/// </summary>
public class Certification : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string? IssuingAuthority { get; set; }
    
    public DateTime? IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    
    public string? CertificateNumber { get; set; }
    public string? DocumentUrl { get; set; }
    
    public bool IsVerified { get; set; } = false;
}
