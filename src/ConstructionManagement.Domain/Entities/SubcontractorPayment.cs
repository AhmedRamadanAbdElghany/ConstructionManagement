using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Payment tracking for subcontractors
    /// </summary>
    public class SubcontractorPayment : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        // References
        public int SubcontractorId { get; set; }
        [ForeignKey(nameof(SubcontractorId))]
        public virtual Subcontractor Subcontractor { get; set; } = null!;

        public int? ContractId { get; set; }
        [ForeignKey(nameof(ContractId))]
        public virtual SubcontractorContract? Contract { get; set; }

        public int? ProjectId { get; set; }
        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }

        // Payment Details
        public string PaymentNumber { get; set; } = string.Empty;
        public PaymentType PaymentType { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }

        // Financial
        public decimal Amount { get; set; }
        public string? Currency { get; set; } = "EGP";
        public decimal? ExchangeRate { get; set; } = 1;
        public decimal? AmountInBaseCurrency { get; set; }

        // Deductions
        public decimal? RetentionDeducted { get; set; } = 0;
        public decimal? TaxDeducted { get; set; } = 0;
        public decimal? OtherDeductions { get; set; } = 0;
        public decimal? LiquidatedDamages { get; set; } = 0;
        public decimal? NetPayment { get; set; }

        // Milestone info (if payment is milestone-based)
        public string? MilestoneName { get; set; }
        public int? MilestoneNumber { get; set; }
        public double? MilestoneCompletionPercentage { get; set; }

        // Status
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        public DateTime? StatusDate { get; set; }
        public string? StatusNotes { get; set; }

        // Dates
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? PaymentDate { get; set; }

        // Documentation
        public string? InvoiceUrl { get; set; }
        public string? PaymentReceiptUrl { get; set; }
        public string? ApprovalDocumentUrl { get; set; }

        // Approval workflow
        public string? RequestedBy { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public int? ApprovalLevel { get; set; } = 1;

        // Related invoice (if linked to main project invoice)
        public int? InvoiceId { get; set; }
        public string? RelatedInvoiceNumber { get; set; }
    }

    public enum PaymentType
    {
        Advance = 1,
        Milestone = 2,
        Progress = 3,
        Final = 4,
        RetentionRelease = 5,
        ChangeOrder = 6,
        Variation = 7,
        Reimbursement = 8,
        Penalty = 9
    }

    public enum PaymentStatus
    {
        Pending = 0,
        Submitted = 1,
        UnderReview = 2,
        Approved = 3,
        Rejected = 4,
        Paid = 5,
        Cancelled = 6
    }
}
