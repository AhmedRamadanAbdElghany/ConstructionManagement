using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    public class VendorTransaction : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company? Company { get; set; }

        public int VendorId { get; set; }
        [ForeignKey(nameof(VendorId))]
        public virtual Vendor Vendor { get; set; } = null!;

        public int VendorProductId { get; set; }
        [ForeignKey(nameof(VendorProductId))]
        public virtual VendorProduct VendorProduct { get; set; } = null!;

        public string TransactionType { get; set; } = string.Empty; // "Sale", "Purchase", "Adjustment"
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }
        
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
        public string? ReferenceNumber { get; set; } // Invoice # or External Ref
    }
}
