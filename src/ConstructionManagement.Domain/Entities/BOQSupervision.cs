using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Supervision fee configuration for a BOQ item (1:1 relationship)
/// Exists only when AccountingType = "Supervision" or "Mixed"
/// Uses shared primary key with BOQItem (ItemId = PK + FK)
/// </summary>
public class BOQSupervision : BaseEntity
{
    [Key]
    [ForeignKey(nameof(Item))]
    public int Id { get; set; }          // ← most teams prefer "Id" name even in shared PK

    public virtual BOQItem Item { get; set; } = null!;

    // Percentage of the base amount that is supervision fee
    public decimal SupervisionPercentage { get; set; }

    // Defines what amount the percentage is applied to
    public string BaseCalculation { get; set; } = "ThisItemInvoices";
    // Common values: "ThisItemInvoices", "AllProjectInvoices", "CustomAmount"

    // Used when BaseCalculation = "CustomAmount"
    public decimal? CustomBaseAmount { get; set; }

    // Final calculated supervision budget (used in progress & profitability)
    // Non-nullable + default 0 prevents division-by-zero in many calculations
    public decimal EstimatedTotalCost { get; set; } = 0m;
}