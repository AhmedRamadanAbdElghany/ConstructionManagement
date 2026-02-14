using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    public class Vendor : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? ContactPerson { get; set; }
        public string? Notes { get; set; }

        // Material/Service type (e.g., Cement, Sand, Steel, etc.)
        public string? VendorType { get; set; }

        // Balance/Money tracking
        public decimal? CurrentBalance { get; set; } = 0;
        public decimal? TotalPaid { get; set; } = 0;
        public decimal? TotalInvoiced { get; set; } = 0;

        // Status
        public bool IsActive { get; set; } = true;

        // Owner user reference (if linked to a WarehouseOwner)
        public int? UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }

        // Geolocation
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        // Discovery Visibility
        public bool IsPublic { get; set; } = false;

        // Navigation properties
        public virtual ICollection<VendorInvoice> Invoices { get; set; } = new List<VendorInvoice>();
        public virtual ICollection<VendorProduct> Products { get; set; } = new List<VendorProduct>();
    }
}
