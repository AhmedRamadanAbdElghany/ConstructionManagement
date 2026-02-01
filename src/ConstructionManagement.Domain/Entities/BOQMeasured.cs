using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Measured BOQ item data (quantity-based billing)
/// 1:1 dependent entity – shares primary key with BOQItem
/// Only exists when AccountingType = "Measured" or "Mixed"
/// </summary>
public class BOQMeasured : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    public virtual BOQItem Item { get; set; } = null!;

    /// <summary>
    /// Agreed / contracted quantity from BOQ / contract
    /// </summary>
    public decimal AgreedQuantity { get; set; }

    /// <summary>
    /// Unit price per unit (EGP/m³, EGP/m², etc.)
    /// </summary>
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Cumulative executed / measured quantity up to now
    /// Used to calculate progress % and billed amount
    /// </summary>
    public decimal ExecutedQuantity { get; set; } = 0m;

    // Optional – very useful computed properties (not stored)
    public decimal ExecutedValue => ExecutedQuantity * UnitPrice;

    public decimal RemainingQuantity => AgreedQuantity - ExecutedQuantity;

    public decimal ProgressPercentage =>
        AgreedQuantity != 0 ? (ExecutedQuantity / AgreedQuantity) * 100m : 0m;
}
