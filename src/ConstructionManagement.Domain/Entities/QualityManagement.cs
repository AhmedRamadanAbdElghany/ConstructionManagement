namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Quality standards/criteria that inspections are based on
    /// </summary>
    public class QualityStandard : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // Structural, Electrical, Plumbing, Finishing, Safety
        public string StandardCode { get; set; } = string.Empty; // ISO, ASTM, or custom code
        public string Criteria { get; set; } = string.Empty; // JSON criteria
        public string AcceptanceCriteria { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual ICollection<QualityInspectionItem> InspectionItems { get; set; } = new List<QualityInspectionItem>();
    }

    /// <summary>
    /// Quality inspections performed on projects/phases
    /// </summary>
    public class QualityInspection : ICompanyEntity, IProjectEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public int? PhaseId { get; set; }
        public string InspectionNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string InspectionType { get; set; } = string.Empty; // Daily, Weekly, Monthly, Final, Random
        public string Status { get; set; } = "Scheduled"; // Scheduled, InProgress, Completed, Cancelled
        public DateTime ScheduledDate { get; set; }
        public DateTime InspectionDate { get; set; }
        public DateTime? ActualStartDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public string InspectorName { get; set; } = string.Empty;
        public string InspectorId { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string WeatherConditions { get; set; } = string.Empty;
        public string OverallResult { get; set; } = string.Empty; // Pass, Fail, Conditional
        public decimal OverallScore { get; set; }
        public decimal Score { get; set; }
        public int TotalItems { get; set; }
        public int PassedItems { get; set; }
        public int FailedItems { get; set; }
        public int NcItems { get; set; } // Non-conformance items
        public string Notes { get; set; } = string.Empty;
        public string Attachments { get; set; } = string.Empty; // JSON array of file paths
        public bool RequiresFollowUp { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual Project? Project { get; set; }
        public virtual Phase? Phase { get; set; }
        public virtual ICollection<QualityInspectionItem> InspectionItems { get; set; } = new List<QualityInspectionItem>();
        public virtual ICollection<Defect> Defects { get; set; } = new List<Defect>();
    }

    /// <summary>
    /// Individual inspection items within an inspection
    /// </summary>
    public class QualityInspectionItem : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int InspectionId { get; set; }
        public int StandardId { get; set; }
        public int OrderNumber { get; set; }
        public string ItemDescription { get; set; } = string.Empty;
        public string CheckMethod { get; set; } = string.Empty;
        public string ExpectedResult { get; set; } = string.Empty;
        public string ActualResult { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty; // Pass, Fail, N/A, Partial
        public string Deviation { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public string? PhotoEvidence { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual QualityInspection? Inspection { get; set; }
        public virtual QualityStandard? Standard { get; set; }
    }

    /// <summary>
    /// Defect reports found during inspections or daily operations
    /// </summary>
    public class Defect : ICompanyEntity, IProjectEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public int? PhaseId { get; set; }
        public int? InspectionId { get; set; }
        public string DefectNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // Structural, Electrical, Plumbing, Finishing, Other
        public string Severity { get; set; } = string.Empty; // Critical, Major, Minor, Cosmetic
        public string Status { get; set; } = "Open"; // Open, InProgress, Resolved, Closed, Reopened
        public string Priority { get; set; } = string.Empty; // High, Medium, Low
        public string Location { get; set; } = string.Empty;
        public string Element { get; set; } = string.Empty; // Wall, Floor, Ceiling, Roof, etc.
        public string ReportedBy { get; set; } = string.Empty;
        public string ReportedById { get; set; } = string.Empty;
        public DateTime ReportedDate { get; set; }
        public DateTime? DiscoveryDate { get; set; }
        public DateTime? TargetResolutionDate { get; set; }
        public DateTime? ActualResolutionDate { get; set; }
        public string AssignedTo { get; set; } = string.Empty;
        public string AssignedToId { get; set; } = string.Empty;
        public string RootCause { get; set; } = string.Empty;
        public string CorrectiveAction { get; set; } = string.Empty;
        public string PreventiveAction { get; set; } = string.Empty;
        public decimal EstimatedCost { get; set; }
        public decimal ActualCost { get; set; }
        public string? PhotoBefore { get; set; }
        public string? PhotoAfter { get; set; }
        public string Attachments { get; set; } = string.Empty; // JSON array
        public int PunchListCount { get; set; }
        public bool IsSafetyRelated { get; set; }
        public bool RequiresRebork { get; set; }
        public string ClosureNotes { get; set; } = string.Empty;
        public string VerifiedBy { get; set; } = string.Empty;
        public DateTime? VerifiedDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual Project? Project { get; set; }
        public virtual Phase? Phase { get; set; }
        public virtual QualityInspection? Inspection { get; set; }
        public virtual ICollection<PunchListItem> PunchListItems { get; set; } = new List<PunchListItem>();
        public virtual ICollection<DefectResolution> Resolutions { get; set; } = new List<DefectResolution>();
    }

    /// <summary>
    /// Punch list items for defect tracking and completion verification
    /// </summary>
    public class PunchListItem : ICompanyEntity, IProjectEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public int? PhaseId { get; set; }
        public int? DefectId { get; set; }
        public string ItemNumber { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // Finishing, MEP, Structural, Other
        public string Priority { get; set; } = string.Empty; // High, Medium, Low
        public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed, Verified, Accepted
        public string AssignedTo { get; set; } = string.Empty;
        public string AssignedToId { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string CompletionNotes { get; set; } = string.Empty;
        public string? PhotoBefore { get; set; }
        public string? PhotoAfter { get; set; }
        public string Attachments { get; set; } = string.Empty; // JSON array
        public decimal CostEstimate { get; set; }
        public decimal ActualCost { get; set; }
        public bool IsSafetyItem { get; set; }
        public bool RequiresReinspection { get; set; }
        public DateTime? ReinspectionDate { get; set; }
        public string ReinspectionResult { get; set; } = string.Empty;
        public string VerifiedBy { get; set; } = string.Empty;
        public DateTime? VerifiedDate { get; set; }
        public string AcceptanceNotes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual Project? Project { get; set; }
        public virtual Phase? Phase { get; set; }
        public virtual Defect? Defect { get; set; }
    }

    /// <summary>
    /// Resolution tracking for defects
    /// </summary>
    public class DefectResolution : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int DefectId { get; set; }
        public int SequenceNumber { get; set; }
        public string ActionTaken { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty; // Repair, Replace, Rework, Accept as Is
        public string PerformedBy { get; set; } = string.Empty;
        public string PerformedById { get; set; } = string.Empty;
        public DateTime ActionDate { get; set; }
        public decimal LaborHours { get; set; }
        public decimal MaterialCost { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? PhotoEvidence { get; set; }
        public bool IsSatisfactory { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual Defect? Defect { get; set; }
    }
}
