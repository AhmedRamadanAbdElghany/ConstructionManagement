using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    public class VendorProduct : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        public int VendorId { get; set; }
        [ForeignKey(nameof(VendorId))]
        public virtual Vendor Vendor { get; set; } = null!;

        /// <summary>
        /// Product category reference
        /// </summary>
        public int? CategoryId { get; set; }
        [ForeignKey(nameof(CategoryId))]
        public virtual ProductCategory? Category { get; set; }

        public string Name { get; set; } = string.Empty;
        public string? CategoryLegacy { get; set; } // Legacy field - kept for backward compatibility
        public decimal Price { get; set; }
        public string? Unit { get; set; } // e.g., Ton, m3, Bag
        public string? Description { get; set; }
        
        /// <summary>
        /// Product image URL
        /// </summary>
        public string? ImageUrl { get; set; }
        
        /// <summary>
        /// Product SKU/Code
        /// </summary>
        public string? SKU { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal QuantityInStock { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LowStockThreshold { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PurchasePrice { get; set; }

        /// <summary>
        /// Number of times this product was sold
        /// </summary>
        public int SalesCount { get; set; } = 0;

        /// <summary>
        /// Average rating for this product
        /// </summary>
        public decimal? AverageRating { get; set; }

        /// <summary>
        /// Total number of reviews
        /// </summary>
        public int TotalReviews { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Delivery cost tiers for this product (weight-based pricing)
        /// </summary>
        public virtual ICollection<DeliveryCostTier> DeliveryCostTiers { get; set; } = new List<DeliveryCostTier>();
    }
}
