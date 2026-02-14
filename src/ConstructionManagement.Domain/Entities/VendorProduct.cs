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

        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; } // e.g., Cement, Sand, Steel
        public decimal Price { get; set; }
        public string? Unit { get; set; } // e.g., Ton, m3, Bag
        public string? Description { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal QuantityInStock { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LowStockThreshold { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PurchasePrice { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
