using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    public class MiscExpense : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        // Expense details
        public string ExpenseNumber { get; set; } = string.Empty;
        public DateTime ExpenseDate { get; set; }
        public decimal Amount { get; set; }
        public string Category { get; set; } = string.Empty; // e.g., Office Supplies, Maintenance, Travel, etc.
        public string Description { get; set; } = string.Empty;
        public string? Notes { get; set; }

        // Receipt file
        public string? ReceiptUrl { get; set; }
        public string? OriginalFileName { get; set; }

        // Project reference (optional)
        public int? ProjectId { get; set; }
        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }

        // Approval workflow
        public ExpenseApprovalStatus ApprovalStatus { get; set; } = ExpenseApprovalStatus.Pending;
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

    public enum ExpenseApprovalStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }
}
