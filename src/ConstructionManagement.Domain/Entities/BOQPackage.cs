using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Detail for BOQ Item when AccountingType = "Package"
/// Represents a fixed-price work package (Lump Sum)
/// </summary>
public class BOQPackage : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    // 1:1 relationship with BOQItem (Foreign Key is the PK)
    [ForeignKey(nameof(Id))]
    public virtual BOQItem BOQItem { get; set; } = null!;

    // -- Package Specifics -----------------------------------------------------
    public decimal TotalPackageValue { get; set; }       // Total fixed price for this package
    public decimal CompletionPercentage { get; set; }    // Current progress (0-100%)

    // Optional: Payment terms or milestones could be added here or as a separate collection
    public string? PaymentTerms { get; set; }
    
    public decimal EstimatedTotalCost => TotalPackageValue;
}
