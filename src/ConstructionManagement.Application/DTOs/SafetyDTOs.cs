using System.ComponentModel.DataAnnotations;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.DTOs
{
    #region Safety Checklist DTOs

    public class SafetyChecklistDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Category { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int ItemsCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateSafetyChecklistRequest
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public int Category { get; set; }
    }

    public class UpdateSafetyChecklistRequest
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public int Category { get; set; }

        public bool IsActive { get; set; }
    }

    public class SafetyChecklistItemDto
    {
        public int Id { get; set; }
        public int SafetyChecklistId { get; set; }
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsCritical { get; set; }
        public string? ComplianceStandard { get; set; }
    }

    public class CreateSafetyChecklistItemRequest
    {
        public int SafetyChecklistId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public int OrderIndex { get; set; }

        public bool IsCritical { get; set; }

        [MaxLength(500)]
        public string? ComplianceStandard { get; set; }
    }

    #endregion

    #region Safety Inspection DTOs

    public class SafetyInspectionDto
    {
        public int Id { get; set; }
        public int SafetyChecklistId { get; set; }
        public string SafetyChecklistName { get; set; } = string.Empty;
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public int InspectorUserId { get; set; }
        public string InspectorName { get; set; } = string.Empty;
        public DateTime InspectionDate { get; set; }
        public string? Location { get; set; }
        public int TotalItems { get; set; }
        public int PassedItems { get; set; }
        public int FailedItems { get; set; }
        public int NAItems { get; set; }
        public double PassRate { get; set; }
        public string? Notes { get; set; }
        public bool RequiresFollowUp { get; set; }
        public string? FollowUpNotes { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateSafetyInspectionRequest
    {
        public int SafetyChecklistId { get; set; }
        public int? ProjectId { get; set; }
        public DateTime InspectionDate { get; set; }

        [MaxLength(500)]
        public string? Location { get; set; }

        [MaxLength(2000)]
        public string? Notes { get; set; }

        public List<InspectionItemResultRequest> ItemResults { get; set; } = new();
    }

    public class InspectionItemResultRequest
    {
        public int SafetyChecklistItemId { get; set; }
        public int Result { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    public class SafetyInspectionItemResultDto
    {
        public int Id { get; set; }
        public int SafetyInspectionId { get; set; }
        public int SafetyChecklistItemId { get; set; }
        public string ItemDescription { get; set; } = string.Empty;
        public int Result { get; set; }
        public string ResultName { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    #endregion

    #region Safety Incident DTOs

    public class SafetyIncidentDto
    {
        public int Id { get; set; }
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public int? ReportedByUserId { get; set; }
        public string ReporterName { get; set; } = string.Empty;
        public int Severity { get; set; }
        public string SeverityName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime IncidentDate { get; set; }
        public string? Location { get; set; }
        public List<string> InvolvedPersons { get; set; } = new();
        public List<string> Witnesses { get; set; } = new();
        public string? ImmediateActions { get; set; }
        public bool RequiredMedicalAttention { get; set; }
        public decimal EstimatedCost { get; set; }
        public int InvestigationStatus { get; set; }
        public string InvestigationStatusName { get; set; } = string.Empty;
        public string? RootCauseAnalysis { get; set; }
        public string? CorrectiveActions { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateSafetyIncidentRequest
    {
        public int? ProjectId { get; set; }

        public int Severity { get; set; }

        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public DateTime IncidentDate { get; set; }

        [MaxLength(500)]
        public string? Location { get; set; }

        [MaxLength(500)]
        public string? InvolvedPersons { get; set; }

        [MaxLength(500)]
        public string? Witnesses { get; set; }

        [MaxLength(500)]
        public string? ImmediateActions { get; set; }

        public bool RequiredMedicalAttention { get; set; }

        public decimal EstimatedCost { get; set; }
    }

    public class UpdateSafetyIncidentRequest
    {
        public int Severity { get; set; }

        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string? ImmediateActions { get; set; }

        public bool RequiredMedicalAttention { get; set; }

        public int InvestigationStatus { get; set; }

        [MaxLength(2000)]
        public string? RootCauseAnalysis { get; set; }

        [MaxLength(2000)]
        public string? CorrectiveActions { get; set; }

        public DateTime? FollowUpDate { get; set; }
    }

    #endregion

    #region Safety Training DTOs

    public class SafetyTrainingDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string TrainingType { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public int Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public string? TrainerName { get; set; }
        public int DurationMinutes { get; set; }
        public bool RequiresCertification { get; set; }
        public DateTime? CertificationExpiryDate { get; set; }
        public int? MaxParticipants { get; set; }
        public int CurrentParticipants { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateSafetyTrainingRequest
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(100)]
        public string TrainingType { get; set; } = string.Empty;

        public DateTime ScheduledDate { get; set; }

        [MaxLength(200)]
        public string? TrainerName { get; set; }

        public int DurationMinutes { get; set; }

        public bool RequiresCertification { get; set; }

        public DateTime? CertificationExpiryDate { get; set; }

        public int? MaxParticipants { get; set; }
    }

    public class UpdateSafetyTrainingRequest
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(100)]
        public string TrainingType { get; set; } = string.Empty;

        public DateTime ScheduledDate { get; set; }

        public DateTime? CompletedDate { get; set; }

        public int Status { get; set; }

        [MaxLength(200)]
        public string? TrainerName { get; set; }

        public int DurationMinutes { get; set; }

        public bool RequiresCertification { get; set; }

        public DateTime? CertificationExpiryDate { get; set; }

        public int? MaxParticipants { get; set; }

        [MaxLength(500)]
        public string? Participants { get; set; }
    }

    public class CompleteTrainingRequest
    {
        public DateTime CompletedDate { get; set; }

        [MaxLength(500)]
        public string? Participants { get; set; }
    }

    #endregion

    #region Safety Compliance DTOs

    public class SafetyComplianceDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public DateTime ComplianceDate { get; set; }
        public string StandardName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsCompliant { get; set; }
        public string? NonComplianceNotes { get; set; }
        public DateTime? NextReviewDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateSafetyComplianceRequest
    {
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
    }

    #endregion

    #region Safety Dashboard DTOs

    public class SafetyDashboardDto
    {
        public int TotalChecklists { get; set; }
        public int TotalInspections { get; set; }
        public int TotalIncidents { get; set; }
        public int TotalTrainings { get; set; }

        // Inspection Statistics
        public double AveragePassRate { get; set; }
        public int InspectionsThisMonth { get; set; }
        public int InspectionsPassed { get; set; }
        public int InspectionsFailed { get; set; }

        // Incident Statistics
        public int IncidentsThisMonth { get; set; }
        public int CriticalIncidents { get; set; }
        public int PendingInvestigations { get; set; }

        // Training Statistics
        public int TrainingsCompleted { get; set; }
        public int UpcomingTrainings { get; set; }
        public int ExpiringCertifications { get; set; }

        // Recent Items
        public List<SafetyIncidentDto> RecentIncidents { get; set; } = new();
        public List<SafetyInspectionDto> RecentInspections { get; set; } = new();
        public List<SafetyTrainingDto> UpcomingTrainingsList { get; set; } = new();
    }

    #endregion

    #region Query Parameters

    public class SafetyInspectionQueryParams
    {
        public int? ProjectId { get; set; }
        public int? ChecklistId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? MinPassRate { get; set; }
        public bool? RequiresFollowUp { get; set; }
    }

    public class SafetyIncidentQueryParams
    {
        public int? ProjectId { get; set; }
        public int? Severity { get; set; }
        public int? InvestigationStatus { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class SafetyTrainingQueryParams
    {
        public int? Status { get; set; }
        public string? TrainingType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    #endregion
}
