using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Contract details for subcontractors
    /// </summary>
    public class SubcontractorContract : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        // Subcontractor reference
        public int SubcontractorId { get; set; }
        [ForeignKey(nameof(SubcontractorId))]
        public virtual Subcontractor Subcontractor { get; set; } = null!;

        // Project reference (if linked to specific project)
        public int? ProjectId { get; set; }
        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }

        // Contract Details
        public string ContractNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ContractType { get; set; } = string.Empty;  // Lump Sum, Time & Material, Unit Price
        public string ScopeOfWork { get; set; } = string.Empty;

        // Financial
        public decimal ContractAmount { get; set; }
        public decimal? ApprovedVariationOrders { get; set; } = 0;
        public decimal? RetentionAmount { get; set; }
        public decimal? FinalAmount { get; set; }
        public string? Currency { get; set; } = "EGP";

        // Dates
        public DateTime ContractDate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? PlannedEndDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public DateTime? CompletionCertificateDate { get; set; }

        // Status
        public ContractStatus Status { get; set; } = ContractStatus.Draft;
        public DateTime? StatusDate { get; set; }
        public string? StatusNotes { get; set; }

        // Documentation
        public string? ContractDocumentUrl { get; set; }
        public string? InsuranceCertificateUrl { get; set; }
        public string? WorkPermitUrl { get; set; }
        public string? CompletionCertificateUrl { get; set; }

        // Payment Terms
        public string? PaymentTerms { get; set; }  // e.g., "Net 30", "50% advance, 50% completion"
        public int? PaymentMilestoneCount { get; set; }

        // Change Orders tracking
        public int? ChangeOrderCount { get; set; } = 0;
        public decimal? TotalChangeOrderValue { get; set; } = 0;

        // Performance
        public double? CompletionPercentage { get; set; }
        public bool IsUnderWarranty { get; set; } = false;
        public DateTime? WarrantyEndDate { get; set; }

        // Navigation properties
        public virtual ICollection<SubcontractorPayment> Payments { get; set; } = new List<SubcontractorPayment>();
    }

    public enum ContractStatus
    {
        Draft = 0,
        PendingApproval = 1,
        Approved = 2,
        Active = 3,
        OnHold = 4,
        Completed = 5,
        Terminated = 6,
        Disputed = 7
    }
}
