using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents customer loyalty tier discounts
/// </summary>
public class CustomerTierDiscount : BaseEntity
{
    /// <summary>
    /// Customer/Company Owner user ID
    /// </summary>
    public int CustomerUserId { get; set; }
    [ForeignKey(nameof(CustomerUserId))]
    public virtual User? CustomerUser { get; set; }

    /// <summary>
    /// Supplier/Inventory Owner user ID
    /// </summary>
    public int SupplierUserId { get; set; }
    [ForeignKey(nameof(SupplierUserId))]
    public virtual User? SupplierUser { get; set; }

    /// <summary>
    /// Customer tier level
    /// </summary>
    public TierLevel Tier { get; set; }

    /// <summary>
    /// Loyalty discount percentage
    /// </summary>
    public decimal DiscountPercent { get; set; }

    /// <summary>
    /// Total number of orders placed
    /// </summary>
    public int TotalOrdersCount { get; set; } = 0;

    /// <summary>
    /// Total amount spent
    /// </summary>
    public decimal TotalSpent { get; set; } = 0;

    /// <summary>
    /// Tier valid from date
    /// </summary>
    public DateTime ValidFrom { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Tier valid until date (null = unlimited)
    /// </summary>
    public DateTime? ValidUntil { get; set; }

    /// <summary>
    /// Customer tier levels
    /// </summary>
    public enum TierLevel
    {
        Bronze = 1,
        Silver = 2,
        Gold = 3,
        Platinum = 4
    }
}
