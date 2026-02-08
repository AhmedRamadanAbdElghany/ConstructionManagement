using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ConstructionManagement.Application.DTOs
{
    #region Enums

    public enum PaymentType
    {
        Advance,
        Milestone,
        RetentionRelease,
        Final,
        ChangeOrder,
        ExtraWork,
        Material,
        Equipment,
        Labor,
        Other
    }

    public enum PaymentStatus
    {
        Pending,
        Approved,
        Processing,
        Paid,
        Partial,
        Overdue,
        Cancelled,
        Rejected
    }

    #endregion

    #region Subcontractor DTOs

    public class SubcontractorDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? ContactPerson { get; set; }
        public string? Notes { get; set; }
        public string? TradeSpecialty { get; set; }
        public string? LicenseNumber { get; set; }
        public string? InsurancePolicyNumber { get; set; }
        public DateTime? InsuranceExpiryDate { get; set; }
        public string? InsuranceCertificateUrl { get; set; }
        public decimal? CurrentBalance { get; set; }
        public decimal? TotalPaid { get; set; }
        public decimal? TotalInvoiced { get; set; }
        public decimal? RetentionPercentage { get; set; }
        public bool IsActive { get; set; }
        public bool IsApproved { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string? ApprovedBy { get; set; }
        public double? AverageRating { get; set; }
        public int? TotalProjectsCompleted { get; set; }
        public int? TotalProjectsOngoing { get; set; }
        public double? OnTimeDeliveryRate { get; set; }
        public double? QualityScore { get; set; }
        public double? SafetyScore { get; set; }
        public string? RatingGrade { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateSubcontractorRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? ContactPerson { get; set; }
        public string? Notes { get; set; }
        public string? TradeSpecialty { get; set; }
        public string? LicenseNumber { get; set; }
        public string? InsurancePolicyNumber { get; set; }
        public DateTime? InsuranceExpiryDate { get; set; }
        public string? InsuranceCertificateUrl { get; set; }
        public decimal? RetentionPercentage { get; set; } = 5;
        public bool IsActive { get; set; } = true;
    }

    public class UpdateSubcontractorRequest
    {
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? ContactPerson { get; set; }
        public string? Notes { get; set; }
        public string? TradeSpecialty { get; set; }
        public string? LicenseNumber { get; set; }
        public string? InsurancePolicyNumber { get; set; }
        public DateTime? InsuranceExpiryDate { get; set; }
        public string? InsuranceCertificateUrl { get; set; }
        public decimal? RetentionPercentage { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ApproveSubcontractorRequest
    {
        public string? Notes { get; set; }
    }

    public class SubcontractorSummaryDto
    {
        public int TotalSubcontractors { get; set; }
        public int ActiveSubcontractors { get; set; }
        public int PendingApproval { get; set; }
        public int ApprovedSubcontractors { get; set; }
        public int ExpiringInsurance { get; set; }
        public decimal TotalOutstandingBalance { get; set; }
        public double AverageRating { get; set; }
        public List<string> TopRatedSubcontractors { get; set; } = new();
        public List<string> TradeSpecialties { get; set; } = new();
    }

    #endregion

    #region Contract DTOs

    public class SubcontractorContractDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int SubcontractorId { get; set; }
        public string? SubcontractorName { get; set; }
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public string ContractNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ContractType { get; set; } = string.Empty;
        public string ScopeOfWork { get; set; } = string.Empty;
        public decimal ContractAmount { get; set; }
        public decimal? ApprovedVariationOrders { get; set; }
        public decimal? RetentionAmount { get; set; }
        public decimal? FinalAmount { get; set; }
        public string? Currency { get; set; }
        public DateTime ContractDate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? PlannedEndDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public DateTime? CompletionCertificateDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? StatusNotes { get; set; }
        public string? ContractDocumentUrl { get; set; }
        public string? InsuranceCertificateUrl { get; set; }
        public string? WorkPermitUrl { get; set; }
        public string? CompletionCertificateUrl { get; set; }
        public string? PaymentTerms { get; set; }
        public int? PaymentMilestoneCount { get; set; }
        public int? ChangeOrderCount { get; set; }
        public decimal? TotalChangeOrderValue { get; set; }
        public double? CompletionPercentage { get; set; }
        public bool IsUnderWarranty { get; set; }
        public DateTime? WarrantyEndDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateContractRequest
    {
        [Required]
        public int SubcontractorId { get; set; }
        public int? ProjectId { get; set; }
        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        public string ContractType { get; set; } = string.Empty;
        public string ScopeOfWork { get; set; } = string.Empty;
        [Required]
        public decimal ContractAmount { get; set; }
        public decimal? RetentionPercentage { get; set; }
        public string? Currency { get; set; } = "EGP";
        [Required]
        public DateTime StartDate { get; set; }
        public DateTime? PlannedEndDate { get; set; }
        public string? PaymentTerms { get; set; }
        public string? ContractDocumentUrl { get; set; }
        public string? InsuranceCertificateUrl { get; set; }
        public string? WorkPermitUrl { get; set; }
    }

    public class UpdateContractRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? ContractType { get; set; }
        public string? ScopeOfWork { get; set; }
        public decimal? ContractAmount { get; set; }
        public decimal? ApprovedVariationOrders { get; set; }
        public DateTime? PlannedEndDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public string? StatusNotes { get; set; }
        public string? ContractDocumentUrl { get; set; }
        public string? CompletionCertificateUrl { get; set; }
    }

    public class ContractStatusUpdateRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    #endregion

    #region Payment DTOs

    public class SubcontractorPaymentDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int SubcontractorId { get; set; }
        public string? SubcontractorName { get; set; }
        public int? ContractId { get; set; }
        public string? ContractNumber { get; set; }
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public string PaymentNumber { get; set; } = string.Empty;
        public string PaymentType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public decimal Amount { get; set; }
        public string? Currency { get; set; }
        public decimal? RetentionDeducted { get; set; }
        public decimal? TaxDeducted { get; set; }
        public decimal? OtherDeductions { get; set; }
        public decimal? LiquidatedDamages { get; set; }
        public decimal? NetPayment { get; set; }
        public string? MilestoneName { get; set; }
        public int? MilestoneNumber { get; set; }
        public double? MilestoneCompletionPercentage { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? RequestedBy { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovalDate { get; set; }
    }

    public class CreatePaymentRequest
    {
        [Required]
        public int SubcontractorId { get; set; }
        public int? ContractId { get; set; }
        public int? ProjectId { get; set; }
        [Required]
        public PaymentType PaymentType { get; set; }
        public string? Description { get; set; }
        [Required]
        public decimal Amount { get; set; }
        public string? Currency { get; set; } = "EGP";
        public decimal? RetentionDeducted { get; set; }
        public decimal? TaxDeducted { get; set; }
        public decimal? OtherDeductions { get; set; }
        public decimal? LiquidatedDamages { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public string? MilestoneName { get; set; }
        public int? MilestoneNumber { get; set; }
        public string? InvoiceUrl { get; set; }
    }

    public class UpdatePaymentStatusRequest
    {
        [Required]
        public PaymentStatus Status { get; set; }
        public string? Notes { get; set; }
    }

    #endregion

    #region Rating DTOs

    public class SubcontractorRatingDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int SubcontractorId { get; set; }
        public string? SubcontractorName { get; set; }
        public int? ContractId { get; set; }
        public string? ContractNumber { get; set; }
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public string EvaluatorId { get; set; } = string.Empty;
        public string EvaluatorName { get; set; } = string.Empty;
        public string EvaluatorRole { get; set; } = string.Empty;
        public DateTime EvaluationDate { get; set; }
        public DateTime? ContractCompletionDate { get; set; }
        public double QualityOfWork { get; set; }
        public double Timeliness { get; set; }
        public double Communication { get; set; }
        public double Professionalism { get; set; }
        public double SafetyCompliance { get; set; }
        public double BudgetAdherence { get; set; }
        public double ProblemSolving { get; set; }
        public double Documentation { get; set; }
        public double OverallRating { get; set; }
        public string RatingGrade { get; set; } = string.Empty;
        public string? Strengths { get; set; }
        public string? Weaknesses { get; set; }
        public string? Recommendations { get; set; }
        public string? GeneralComments { get; set; }
        public int? DaysEarly { get; set; }
        public int? DaysLate { get; set; }
        public decimal? BudgetVariance { get; set; }
        public bool WouldRecommend { get; set; }
        public bool WouldHireAgain { get; set; }
        public bool IsFinalized { get; set; }
        public string? ReviewedBy { get; set; }
        public DateTime? ReviewDate { get; set; }
    }

    public class CreateRatingRequest
    {
        [Required]
        public int SubcontractorId { get; set; }
        public int? ContractId { get; set; }
        public int? ProjectId { get; set; }
        public DateTime? ContractCompletionDate { get; set; }
        [Range(1, 5)]
        public double QualityOfWork { get; set; }
        [Range(1, 5)]
        public double Timeliness { get; set; }
        [Range(1, 5)]
        public double Communication { get; set; }
        [Range(1, 5)]
        public double Professionalism { get; set; }
        [Range(1, 5)]
        public double SafetyCompliance { get; set; }
        [Range(1, 5)]
        public double BudgetAdherence { get; set; }
        [Range(1, 5)]
        public double ProblemSolving { get; set; }
        [Range(1, 5)]
        public double Documentation { get; set; }
        public string? Strengths { get; set; }
        public string? Weaknesses { get; set; }
        public string? Recommendations { get; set; }
        public string? GeneralComments { get; set; }
        public int? DaysEarly { get; set; }
        public int? DaysLate { get; set; }
        public decimal? BudgetVariance { get; set; }
        public bool WouldRecommend { get; set; }
        public bool WouldHireAgain { get; set; }
    }

    public class RatingSummaryDto
    {
        public int SubcontractorId { get; set; }
        public string SubcontractorName { get; set; } = string.Empty;
        public int TotalRatings { get; set; }
        public double AverageQualityOfWork { get; set; }
        public double AverageTimeliness { get; set; }
        public double AverageCommunication { get; set; }
        public double AverageProfessionalism { get; set; }
        public double AverageSafetyCompliance { get; set; }
        public double AverageBudgetAdherence { get; set; }
        public double AverageProblemSolving { get; set; }
        public double AverageDocumentation { get; set; }
        public double OverallAverageRating { get; set; }
        public string RatingGrade { get; set; } = string.Empty;
        public double RecommendationRate { get; set; }
        public List<SubcontractorRatingDto> RecentRatings { get; set; } = new();
    }

    #endregion
}
