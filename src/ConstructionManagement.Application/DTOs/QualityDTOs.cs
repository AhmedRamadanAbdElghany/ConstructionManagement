using System.ComponentModel.DataAnnotations;

namespace ConstructionManagement.Application.DTOs
{
    #region Quality Standard DTOs

    public class QualityStandardDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string StandardCode { get; set; } = string.Empty;
        public string Criteria { get; set; } = string.Empty;
        public string AcceptanceCriteria { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
    }

    public class CreateQualityStandardRequest
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;

        [StringLength(50)]
        public string StandardCode { get; set; } = string.Empty;

        public string Criteria { get; set; } = string.Empty;

        public string AcceptanceCriteria { get; set; } = string.Empty;
    }

    public class UpdateQualityStandardRequest
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;

        [StringLength(50)]
        public string StandardCode { get; set; } = string.Empty;

        public string Criteria { get; set; } = string.Empty;

        public string AcceptanceCriteria { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }

    #endregion

    #region Quality Inspection DTOs

    public class QualityInspectionDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public int? PhaseId { get; set; }
        public string? ProjectName { get; set; }
        public string? PhaseName { get; set; }
        public string InspectionNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string InspectionType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public DateTime? ActualStartDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public string InspectorName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string WeatherConditions { get; set; } = string.Empty;
        public string OverallResult { get; set; } = string.Empty;
        public decimal Score { get; set; }
        public int TotalItems { get; set; }
        public int PassedItems { get; set; }
        public int FailedItems { get; set; }
        public int NcItems { get; set; }
        public string Notes { get; set; } = string.Empty;
        public bool RequiresFollowUp { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public List<QualityInspectionItemDto>? Items { get; set; }
    }

    public class CreateQualityInspectionRequest
    {
        public int? ProjectId { get; set; }
        public int? PhaseId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string InspectionType { get; set; } = string.Empty;

        [Required]
        public DateTime ScheduledDate { get; set; }

        [StringLength(200)]
        public string InspectorName { get; set; } = string.Empty;

        [StringLength(500)]
        public string Location { get; set; } = string.Empty;

        [StringLength(200)]
        public string WeatherConditions { get; set; } = string.Empty;

        public List<CreateQualityInspectionItemRequest>? Items { get; set; }
    }

    public class UpdateQualityInspectionRequest
    {
        [Required]
        public int Id { get; set; }

        public int? ProjectId { get; set; }
        public int? PhaseId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string InspectionType { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public DateTime? ActualStartDate { get; set; }
        public DateTime? ActualEndDate { get; set; }

        [StringLength(200)]
        public string InspectorName { get; set; } = string.Empty;

        [StringLength(500)]
        public string Location { get; set; } = string.Empty;

        [StringLength(200)]
        public string WeatherConditions { get; set; } = string.Empty;

        public string OverallResult { get; set; } = string.Empty;
        public decimal Score { get; set; }
        public string Notes { get; set; } = string.Empty;
        public bool RequiresFollowUp { get; set; }
        public DateTime? FollowUpDate { get; set; }
    }

    public class QualityInspectionItemDto
    {
        public int Id { get; set; }
        public int InspectionId { get; set; }
        public int StandardId { get; set; }
        public string? StandardName { get; set; }
        public int OrderNumber { get; set; }
        public string ItemDescription { get; set; } = string.Empty;
        public string CheckMethod { get; set; } = string.Empty;
        public string ExpectedResult { get; set; } = string.Empty;
        public string ActualResult { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;
        public string Deviation { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public string? PhotoEvidence { get; set; }
    }

    public class CreateQualityInspectionItemRequest
    {
        [Required]
        public int StandardId { get; set; }

        public int OrderNumber { get; set; }

        [StringLength(500)]
        public string ItemDescription { get; set; } = string.Empty;

        [StringLength(200)]
        public string CheckMethod { get; set; } = string.Empty;

        [StringLength(500)]
        public string ExpectedResult { get; set; } = string.Empty;

        [StringLength(500)]
        public string ActualResult { get; set; } = string.Empty;

        [StringLength(20)]
        public string Result { get; set; } = string.Empty;

        [StringLength(500)]
        public string Deviation { get; set; } = string.Empty;

        [StringLength(500)]
        public string Remarks { get; set; } = string.Empty;
    }

    public class UpdateInspectionItemResultRequest
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(500)]
        public string ActualResult { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Result { get; set; } = string.Empty;

        [StringLength(500)]
        public string Deviation { get; set; } = string.Empty;

        [StringLength(500)]
        public string Remarks { get; set; } = string.Empty;

        public string? PhotoEvidence { get; set; }
    }

    public class CompleteInspectionRequest
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(20)]
        public string OverallResult { get; set; } = string.Empty;

        public decimal Score { get; set; }

        [StringLength(1000)]
        public string Notes { get; set; } = string.Empty;
    }

    #endregion

    #region Defect DTOs

    public class DefectDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public int? PhaseId { get; set; }
        public int? InspectionId { get; set; }
        public string? ProjectName { get; set; }
        public string? PhaseName { get; set; }
        public string DefectNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Element { get; set; } = string.Empty;
        public string ReportedBy { get; set; } = string.Empty;
        public DateTime ReportedDate { get; set; }
        public DateTime? DiscoveryDate { get; set; }
        public DateTime? TargetResolutionDate { get; set; }
        public DateTime? ActualResolutionDate { get; set; }
        public string AssignedTo { get; set; } = string.Empty;
        public string RootCause { get; set; } = string.Empty;
        public string CorrectiveAction { get; set; } = string.Empty;
        public string PreventiveAction { get; set; } = string.Empty;
        public decimal EstimatedCost { get; set; }
        public decimal ActualCost { get; set; }
        public string? PhotoBefore { get; set; }
        public string? PhotoAfter { get; set; }
        public int PunchListCount { get; set; }
        public bool IsSafetyRelated { get; set; }
        public bool RequiresRebork { get; set; }
        public string ClosureNotes { get; set; } = string.Empty;
        public string VerifiedBy { get; set; } = string.Empty;
        public DateTime? VerifiedDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public List<DefectResolutionDto>? Resolutions { get; set; }
    }

    public class CreateDefectRequest
    {
        public int? ProjectId { get; set; }
        public int? PhaseId { get; set; }
        public int? InspectionId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Severity { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Priority { get; set; } = string.Empty;

        [StringLength(500)]
        public string Location { get; set; } = string.Empty;

        [StringLength(100)]
        public string Element { get; set; } = string.Empty;

        public DateTime? DiscoveryDate { get; set; }
        public DateTime? TargetResolutionDate { get; set; }
        public string? AssignedToId { get; set; }
        public bool IsSafetyRelated { get; set; }
        public bool RequiresRebork { get; set; }
        public string? PhotoBefore { get; set; }
    }

    public class UpdateDefectRequest
    {
        [Required]
        public int Id { get; set; }

        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        [StringLength(50)]
        public string Severity { get; set; } = string.Empty;

        [StringLength(50)]
        public string Status { get; set; } = string.Empty;

        [StringLength(50)]
        public string Priority { get; set; } = string.Empty;

        [StringLength(500)]
        public string Location { get; set; } = string.Empty;

        [StringLength(100)]
        public string Element { get; set; } = string.Empty;

        public DateTime? TargetResolutionDate { get; set; }
        public string? AssignedToId { get; set; }
        public string RootCause { get; set; } = string.Empty;
        public string CorrectiveAction { get; set; } = string.Empty;
        public string PreventiveAction { get; set; } = string.Empty;
        public decimal EstimatedCost { get; set; }
        public bool IsSafetyRelated { get; set; }
        public bool RequiresRebork { get; set; }
    }

    public class AssignDefectRequest
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public string AssignedToId { get; set; } = string.Empty;

        public DateTime? TargetResolutionDate { get; set; }
    }

    public class ResolveDefectRequest
    {
        [Required]
        public int Id { get; set; }

        [StringLength(500)]
        public string RootCause { get; set; } = string.Empty;

        [StringLength(500)]
        public string CorrectiveAction { get; set; } = string.Empty;

        [StringLength(500)]
        public string PreventiveAction { get; set; } = string.Empty;

        public decimal ActualCost { get; set; }
        public string? PhotoAfter { get; set; }

        [StringLength(500)]
        public string ClosureNotes { get; set; } = string.Empty;
    }

    #endregion

    #region Punch List DTOs

    public class PunchListItemDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public int? PhaseId { get; set; }
        public int? DefectId { get; set; }
        public string? ProjectName { get; set; }
        public string? PhaseName { get; set; }
        public string ItemNumber { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string AssignedTo { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string CompletionNotes { get; set; } = string.Empty;
        public string? PhotoBefore { get; set; }
        public string? PhotoAfter { get; set; }
        public decimal CostEstimate { get; set; }
        public decimal ActualCost { get; set; }
        public bool IsSafetyItem { get; set; }
        public bool RequiresReinspection { get; set; }
        public DateTime? ReinspectionDate { get; set; }
        public string ReinspectionResult { get; set; } = string.Empty;
        public string VerifiedBy { get; set; } = string.Empty;
        public DateTime? VerifiedDate { get; set; }
        public string AcceptanceNotes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
    }

    public class CreatePunchListItemRequest
    {
        public int? ProjectId { get; set; }
        public int? PhaseId { get; set; }
        public int? DefectId { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [StringLength(200)]
        public string Location { get; set; } = string.Empty;

        [StringLength(100)]
        public string Area { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Priority { get; set; } = string.Empty;

        public DateTime? DueDate { get; set; }
        public string? AssignedToId { get; set; }
        public decimal CostEstimate { get; set; }
        public bool IsSafetyItem { get; set; }
        public bool RequiresReinspection { get; set; }
        public string? PhotoBefore { get; set; }
    }

    public class UpdatePunchListItemRequest
    {
        [Required]
        public int Id { get; set; }

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [StringLength(200)]
        public string Location { get; set; } = string.Empty;

        [StringLength(100)]
        public string Area { get; set; } = string.Empty;

        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        [StringLength(50)]
        public string Priority { get; set; } = string.Empty;

        [StringLength(50)]
        public string Status { get; set; } = string.Empty;

        public DateTime? DueDate { get; set; }
        public string? AssignedToId { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string CompletionNotes { get; set; } = string.Empty;
        public decimal CostEstimate { get; set; }
        public decimal ActualCost { get; set; }
        public bool IsSafetyItem { get; set; }
        public bool RequiresReinspection { get; set; }
        public DateTime? ReinspectionDate { get; set; }
    }

    public class CompletePunchListItemRequest
    {
        [Required]
        public int Id { get; set; }

        [StringLength(500)]
        public string CompletionNotes { get; set; } = string.Empty;

        public string? PhotoAfter { get; set; }

        public decimal ActualCost { get; set; }
    }

    public class VerifyPunchListItemRequest
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(20)]
        public string Result { get; set; } = string.Empty; // Accepted, Rejected

        [StringLength(500)]
        public string AcceptanceNotes { get; set; } = string.Empty;

        public DateTime? ReinspectionDate { get; set; }
    }

    #endregion

    #region Defect Resolution DTOs

    public class DefectResolutionDto
    {
        public int Id { get; set; }
        public int DefectId { get; set; }
        public int SequenceNumber { get; set; }
        public string ActionTaken { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
        public string PerformedBy { get; set; } = string.Empty;
        public DateTime ActionDate { get; set; }
        public decimal LaborHours { get; set; }
        public decimal MaterialCost { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? PhotoEvidence { get; set; }
        public bool IsSatisfactory { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class AddDefectResolutionRequest
    {
        [Required]
        public int DefectId { get; set; }

        [Required]
        [StringLength(500)]
        public string ActionTaken { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string ActionType { get; set; } = string.Empty;

        public DateTime ActionDate { get; set; } = DateTime.UtcNow;

        public decimal LaborHours { get; set; }

        public decimal MaterialCost { get; set; }

        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        public string? PhotoEvidence { get; set; }

        public bool IsSatisfactory { get; set; }

        [StringLength(500)]
        public string Remarks { get; set; } = string.Empty;
    }

    #endregion

    #region Quality Statistics DTOs

    public class QualityStatisticsDto
    {
        public int TotalInspections { get; set; }
        public int CompletedInspections { get; set; }
        public int ScheduledInspections { get; set; }
        public int TotalDefects { get; set; }
        public int OpenDefects { get; set; }
        public int ResolvedDefects { get; set; }
        public int CriticalDefects { get; set; }
        public int MajorDefects { get; set; }
        public int MinorDefects { get; set; }
        public int TotalPunchListItems { get; set; }
        public int PendingPunchListItems { get; set; }
        public int CompletedPunchListItems { get; set; }
        public decimal AverageInspectionScore { get; set; }
        public decimal DefectResolutionRate { get; set; }
        public decimal PunchListCompletionRate { get; set; }
        public List<InspectionTypeSummary>? InspectionsByType { get; set; }
        public List<CategorySummary>? DefectsByCategory { get; set; }
        public List<MonthlyTrend>? MonthlyTrends { get; set; }
    }

    public class InspectionTypeSummary
    {
        public string Type { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal AverageScore { get; set; }
    }

    public class CategorySummary
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class MonthlyTrend
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public int Inspections { get; set; }
        public int Defects { get; set; }
        public int Resolutions { get; set; }
        public decimal Score { get; set; }
    }

    #endregion
}
