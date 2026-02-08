using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Subcontractor entity extending vendor capabilities with contract and performance tracking
    /// </summary>
    public class Subcontractor : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        // Basic Info
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? ContactPerson { get; set; }
        public string? Notes { get; set; }

        // Subcontractor-specific
        public string? TradeSpecialty { get; set; }  // e.g., Electrical, Plumbing, HVAC, Concrete
        public string? LicenseNumber { get; set; }
        public string? InsurancePolicyNumber { get; set; }
        public DateTime? InsuranceExpiryDate { get; set; }
        public string? InsuranceCertificateUrl { get; set; }

        // Financial
        public decimal? CurrentBalance { get; set; } = 0;
        public decimal? TotalPaid { get; set; } = 0;
        public decimal? TotalInvoiced { get; set; } = 0;
        public decimal? RetentionPercentage { get; set; } = 5;

        // Status
        public bool IsActive { get; set; } = true;
        public bool IsApproved { get; set; } = false;
        public DateTime? ApprovalDate { get; set; }
        public string? ApprovedBy { get; set; }

        // Performance Metrics (auto-calculated)
        public double? AverageRating { get; set; }
        public int? TotalProjectsCompleted { get; set; }
        public int? TotalProjectsOngoing { get; set; }
        public double? OnTimeDeliveryRate { get; set; }
        public double? QualityScore { get; set; }
        public double? SafetyScore { get; set; }

        // Navigation properties
        public virtual ICollection<SubcontractorContract> Contracts { get; set; } = new List<SubcontractorContract>();
        public virtual ICollection<SubcontractorPayment> Payments { get; set; } = new List<SubcontractorPayment>();
        public virtual ICollection<SubcontractorRating> Ratings { get; set; } = new List<SubcontractorRating>();
    }
}
