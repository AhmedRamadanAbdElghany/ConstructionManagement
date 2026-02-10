using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a "Finishing Package" or "Construction Package" offered by the construction company to their clients.
/// Examples: "Silver Package", "Super Lux Package".
/// </summary>
public class CompanyPackage : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Company? Company { get; set; }


    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Base price per unit (usually per m²) or lump sum.
    /// </summary>
    public decimal Price { get; set; } 

    /// <summary>
    /// List of item descriptions included in this package (stored as JSON or separated string ideally, but simpler here).
    /// </summary>
    public string IncludedItemsDescription { get; set; } = string.Empty;

    /// <summary>
    /// Default variation calculation logic for this package.
    /// </summary>
    public ConstructionManagement.Domain.Enums.PackageVariationCalculation VariationCalculation { get; set; } 
        = ConstructionManagement.Domain.Enums.PackageVariationCalculation.AddFullCost;
}
