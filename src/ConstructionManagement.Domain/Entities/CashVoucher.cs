using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    public class CashVoucher : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        // Voucher details
        public string VoucherNumber { get; set; } = string.Empty;
        public DateTime VoucherDate { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? Notes { get; set; }

        // Worker reference (optional - linked to a worker)
        public int? WorkerUserId { get; set; }
        [ForeignKey(nameof(WorkerUserId))]
        public virtual User? WorkerUser { get; set; }

        // Project reference (optional)
        public int? ProjectId { get; set; }
        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }

        // Category (e.g., Daily Wage, Bonus, Advance, etc.)
        public string Category { get; set; } = string.Empty;

        // Approval workflow
        public VoucherApprovalStatus ApprovalStatus { get; set; } = VoucherApprovalStatus.Pending;
        public int? ApprovedByUserId { get; set; }
        [ForeignKey(nameof(ApprovedByUserId))]
        public virtual User? ApprovedByUser { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? RejectionReason { get; set; }

        // Created by
        public int CreatedByUserId { get; set; }
        [ForeignKey(nameof(CreatedByUserId))]
        public virtual User CreatedByUser { get; set; } = null!;
    }

    public enum VoucherApprovalStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }
}
