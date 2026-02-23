using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Tracks vendor statistics per project for company owners to analyze vendor relationships
    /// </summary>
    public class VendorProjectStat : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        /// <summary>
        /// The vendor this stat belongs to
        /// </summary>
        public int VendorId { get; set; }
        [ForeignKey(nameof(VendorId))]
        public virtual Vendor Vendor { get; set; } = null!;

        /// <summary>
        /// The project this stat is associated with
        /// </summary>
        public int ProjectId { get; set; }
        [ForeignKey(nameof(ProjectId))]
        public virtual Project Project { get; set; } = null!;

        /// <summary>
        /// Total number of invoices/bills for this vendor on this project
        /// </summary>
        public int TotalInvoices { get; set; } = 0;

        /// <summary>
        /// Total amount paid to this vendor for this project
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; } = 0;

        /// <summary>
        /// Total amount pending approval for this vendor on this project
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal PendingAmount { get; set; } = 0;

        /// <summary>
        /// Total approved amount for this vendor on this project
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal ApprovedAmount { get; set; } = 0;

        /// <summary>
        /// Date of the most recent invoice
        /// </summary>
        public DateTime? LastInvoiceDate { get; set; }

        /// <summary>
        /// Date of the first invoice
        /// </summary>
        public DateTime? FirstInvoiceDate { get; set; }
    }
}
