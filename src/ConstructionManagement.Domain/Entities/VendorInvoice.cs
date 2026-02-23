using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    public class VendorInvoice : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        // Vendor reference (nullable to support external/ad-hoc vendors)
        public int? VendorId { get; set; }
        [ForeignKey(nameof(VendorId))]
        public virtual Vendor? Vendor { get; set; }

        /// <summary>
        /// External vendor name for one-time vendors not in the system
        /// Used when VendorId is null
        /// </summary>
        public string? ExternalVendorName { get; set; }

        // Invoice details
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }

        // File attachment
        public string? FileUrl { get; set; }
        public string? OriginalFileName { get; set; }
        public string? FileType { get; set; }
        public long? FileSize { get; set; }

        // Approval workflow
        public InvoiceApprovalStatus ApprovalStatus { get; set; } = InvoiceApprovalStatus.Pending;
        public int? ApprovedByUserId { get; set; }
        [ForeignKey(nameof(ApprovedByUserId))]
        public virtual User? ApprovedByUser { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? RejectionReason { get; set; }

        // Created by
        public int CreatedByUserId { get; set; }
        [ForeignKey(nameof(CreatedByUserId))]
        public virtual User CreatedByUser { get; set; } = null!;

        // Material/Service type
        public string? MaterialType { get; set; }

        // Reference to project if applicable
        public int? ProjectId { get; set; }
        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }
    }

    public enum InvoiceApprovalStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }
}
