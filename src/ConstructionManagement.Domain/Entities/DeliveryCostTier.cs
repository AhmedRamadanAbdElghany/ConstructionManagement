using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Delivery cost tier for vendor products - allows vendors to set weight-based delivery pricing
    /// Example: 500kg-1000kg = 10 EGP/km, 1000kg-15000kg = 20 EGP/km
    /// </summary>
    public class DeliveryCostTier : BaseEntity
    {
        /// <summary>
        /// The product this tier applies to
        /// </summary>
        public int VendorProductId { get; set; }
        [ForeignKey(nameof(VendorProductId))]
        public virtual VendorProduct VendorProduct { get; set; } = null!;

        /// <summary>
        /// Minimum weight in kg for this tier (inclusive)
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal MinWeightKg { get; set; }

        /// <summary>
        /// Maximum weight in kg for this tier (exclusive)
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxWeightKg { get; set; }

        /// <summary>
        /// Price per kilometer for delivery within this weight range
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal PricePerKm { get; set; }

        /// <summary>
        /// Optional fixed fee added to the delivery cost
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal FixedFee { get; set; } = 0;

        /// <summary>
        /// Whether this tier is currently active
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Optional description for this tier (e.g., "Light loads", "Heavy loads")
        /// </summary>
        public string? Description { get; set; }
    }
}
