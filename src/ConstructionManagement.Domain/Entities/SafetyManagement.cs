using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Safety checklist categories
    /// </summary>
    public enum SafetyCategory
    {
        PersonalProtectiveEquipment = 1,
        ElectricalSafety = 2,
        FallProtection = 3,
        HeavyMachinery = 4,
        HazardousMaterials = 5,
        FireSafety = 6,
        Excavation = 7,
        GeneralSite = 8
    }

    /// <summary>
    /// Severity level of safety incidents
    /// </summary>
    public enum IncidentSeverity
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }

    /// <summary>
    /// Status of incident investigation
    /// </summary>
    public enum InvestigationStatus
    {
        Pending = 1,
        InProgress = 2,
        Completed = 3
    }

    /// <summary>
    /// Training status
    /// </summary>
    public enum TrainingStatus
    {
        Scheduled = 1,
        InProgress = 2,
        Completed = 3,
        Expired = 4
    }

    /// <summary>
    /// Safety checklist template
    /// </summary>
    public class SafetyChecklist : BaseEntity
    {
        // Id is inherited from BaseEntity

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public SafetyCategory Category { get; set; }

        public bool IsActive { get; set; } = true;

        public int CreatedByUserId { get; set; }

        // Navigation properties
        public virtual ICollection<SafetyChecklistItem> Items { get; set; } = new List<SafetyChecklistItem>();
        public virtual ICollection<SafetyInspection> Inspections { get; set; } = new List<SafetyInspection>();
    }

    /// <summary>
    /// Individual item in a safety checklist
    /// </summary>
    public class SafetyChecklistItem : BaseEntity
    {
        // Id is inherited from BaseEntity

        public int SafetyChecklistId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public int OrderIndex { get; set; }

        public bool IsCritical { get; set; }

        [MaxLength(500)]
        public string? ComplianceStandard { get; set; }

        // Navigation properties
        [ForeignKey(nameof(SafetyChecklistId))]
        public virtual SafetyChecklist? SafetyChecklist { get; set; }
    }

    /// <summary>
    /// Completed safety inspection
    /// </summary>
    public class SafetyInspection : BaseEntity
    {
        // Id is inherited from BaseEntity

        public int SafetyChecklistId { get; set; }

        public int? ProjectId { get; set; }

        public int InspectorUserId { get; set; }

        public DateTime InspectionDate { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        public string? Location { get; set; }

        public int TotalItems { get; set; }

        public int PassedItems { get; set; }

        public int FailedItems { get; set; }

        public int NAItems { get; set; }

        [MaxLength(2000)]
        public string? Notes { get; set; }

        [MaxLength(500)]
        public string? Attachments { get; set; } // JSON array of file paths

        public bool RequiresFollowUp { get; set; }

        [MaxLength(2000)]
        public string? FollowUpNotes { get; set; }

        public DateTime? FollowUpDate { get; set; }

        // Navigation properties
        [ForeignKey(nameof(SafetyChecklistId))]
        public virtual SafetyChecklist? SafetyChecklist { get; set; }

        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }

        public virtual ICollection<SafetyInspectionItemResult> ItemResults { get; set; } = new List<SafetyInspectionItemResult>();
    }

    /// <summary>
    /// Result of individual checklist item during inspection
    /// </summary>
    public class SafetyInspectionItemResult : BaseEntity
    {
        // Id is inherited from BaseEntity

        public int SafetyInspectionId { get; set; }

        public int SafetyChecklistItemId { get; set; }

        public InspectionResult Result { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        // Navigation properties
        [ForeignKey(nameof(SafetyInspectionId))]
        public virtual SafetyInspection? SafetyInspection { get; set; }

        [ForeignKey(nameof(SafetyChecklistItemId))]
        public virtual SafetyChecklistItem? SafetyChecklistItem { get; set; }
    }

    /// <summary>
    /// Inspection result options
    /// </summary>
    public enum InspectionResult
    {
        Pass = 1,
        Fail = 2,
        NotApplicable = 3
    }

    /// <summary>
    /// Safety incident report
    /// </summary>
    public class SafetyIncident : BaseEntity
    {
        // Id is inherited from BaseEntity

        public int? CompanyId { get; set; }

        public int? ProjectId { get; set; }

        public int? ReportedByUserId { get; set; }

        public IncidentSeverity Severity { get; set; }

        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public DateTime IncidentDate { get; set; }

        [MaxLength(500)]
        public string? Location { get; set; }

        [MaxLength(500)]
        public string? InvolvedPersons { get; set; } // JSON array

        [MaxLength(500)]
        public string? Witnesses { get; set; } // JSON array

        [MaxLength(500)]
        public string? ImmediateActions { get; set; }

        public bool RequiredMedicalAttention { get; set; }

        [MaxLength(500)]
        public string? injuries { get; set; }

        public decimal EstimatedCost { get; set; }

        public InvestigationStatus InvestigationStatus { get; set; } = InvestigationStatus.Pending;

        public DateTime? InvestigationCompletedDate { get; set; }

        [MaxLength(2000)]
        public string? RootCauseAnalysis { get; set; }

        [MaxLength(2000)]
        public string? CorrectiveActions { get; set; }

        public DateTime? FollowUpDate { get; set; }

        [MaxLength(500)]
        public string? Attachments { get; set; } // JSON array of file paths

        // Navigation properties
        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }
    }

    /// <summary>
    /// Safety training record
    /// </summary>
    public class SafetyTraining : BaseEntity
    {
        // Id is inherited from BaseEntity

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(100)]
        public string TrainingType { get; set; } = string.Empty; // e.g., "Orientation", "Certification", "Refresher"

        public DateTime ScheduledDate { get; set; }

        public DateTime? CompletedDate { get; set; }

        public TrainingStatus Status { get; set; } = TrainingStatus.Scheduled;

        [MaxLength(200)]
        public string? TrainerName { get; set; }

        public int DurationMinutes { get; set; }

        public bool RequiresCertification { get; set; }

        public DateTime? CertificationExpiryDate { get; set; }

        [MaxLength(500)]
        public string? TrainingMaterials { get; set; } // JSON array of file paths

        public int? MaxParticipants { get; set; }

        [MaxLength(500)]
        public string? Participants { get; set; } // JSON array of user IDs

        [MaxLength(2000)]
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Safety compliance record for a project
    /// </summary>
    public class SafetyCompliance : BaseEntity, ICompanyEntity
    {
        [Key]
        // Id is inherited from BaseEntity

        public int ProjectId { get; set; }

        public DateTime ComplianceDate { get; set; }

        [Required]
        [MaxLength(200)]
        public string StandardName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public bool IsCompliant { get; set; }

        [MaxLength(2000)]
        public string? NonComplianceNotes { get; set; }

        public DateTime? NextReviewDate { get; set; }

        [MaxLength(500)]
        public string? SupportingDocuments { get; set; } // JSON array

        // Navigation properties
        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }
        
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company? Company { get; set; }
    }
}
