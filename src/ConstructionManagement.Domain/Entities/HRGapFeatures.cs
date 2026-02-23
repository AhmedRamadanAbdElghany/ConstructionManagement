using System;
using System.Collections.Generic;

namespace ConstructionManagement.Domain.Entities
{
    #region Employee Documents Management

    /// <summary>
    /// Categories for employee documents
    /// </summary>
    public class EmployeeDocumentCategory : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public string Name { get; set; } = string.Empty;  // Contract, ID, Certificate, etc.
        public string? Description { get; set; }
        public bool HasExpiry { get; set; }
        public int? ExpiryAlertDays { get; set; }  // Days before expiry to alert
        public bool IsRequired { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<EmployeeDocument> Documents { get; set; } = new List<EmployeeDocument>();
    }

    /// <summary>
    /// Employee document record
    /// </summary>
    public class EmployeeDocument : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int EmployeeId { get; set; }
        public User Employee { get; set; } = null!;

        public int CategoryId { get; set; }
        public EmployeeDocumentCategory Category { get; set; } = null!;

        public string DocumentName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string MimeType { get; set; } = string.Empty;

        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string Status { get; set; } = "Active";  // Active, Expired, Archived

        public bool IsVerified { get; set; }
        public int? VerifiedByUserId { get; set; }
        public User? VerifiedByUser { get; set; }
        public DateTime? VerifiedAt { get; set; }

        public int UploadedByUserId { get; set; }
        public User UploadedByUser { get; set; } = null!;

        public ICollection<EmployeeDocumentVersion> Versions { get; set; } = new List<EmployeeDocumentVersion>();
    }

    /// <summary>
    /// Document version history
    /// </summary>
    public class EmployeeDocumentVersion : BaseEntity
    {
        public int EmployeeDocumentId { get; set; }
        public EmployeeDocument Document { get; set; } = null!;

        public int Version { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string? ChangeNotes { get; set; }

        public int UploadedByUserId { get; set; }
        public User UploadedByUser { get; set; } = null!;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Alerts for expiring documents
    /// </summary>
    public class DocumentExpiryAlert : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int DocumentId { get; set; }
        public EmployeeDocument Document { get; set; } = null!;

        public DateTime ExpiryDate { get; set; }
        public int DaysUntilExpiry { get; set; }
        public string AlertType { get; set; } = string.Empty;  // 30 days, 14 days, 7 days, 1 day
        public bool IsSent { get; set; }
        public DateTime? SentAt { get; set; }
    }

    #endregion

    #region Worker Self-Service Portal

    /// <summary>
    /// Track profile change requests
    /// </summary>
    public class WorkerProfileUpdateRequest : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int WorkerId { get; set; }
        public User Worker { get; set; } = null!;

        public string FieldName { get; set; } = string.Empty;  // e.g., "PhoneNumber", "Address"
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string Status { get; set; } = "Pending";  // Pending, Approved, Rejected

        public int? ReviewedByUserId { get; set; }
        public User? ReviewedByUser { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
    }

    /// <summary>
    /// Emergency contacts for workers
    /// </summary>
    public class EmergencyContact : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string Relationship { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? AlternativePhone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public bool IsPrimary { get; set; }
    }

    /// <summary>
    /// Bank details for payroll
    /// </summary>
    public class BankAccount : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public string? IBAN { get; set; }
        public string? BranchCode { get; set; }
        public bool IsActive { get; set; } = true;
    }

    #endregion

    #region Employee Onboarding Workflow

    /// <summary>
    /// Template for onboarding processes
    /// </summary>
    public class OnboardingTemplate : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? DepartmentId { get; set; }
        public int? RoleId { get; set; }
        public int EstimatedDays { get; set; }
        public bool IsActive { get; set; } = true;

        public int CreatedByUserId { get; set; }
        public User CreatedByUser { get; set; } = null!;

        public ICollection<OnboardingTaskTemplate> TaskTemplates { get; set; } = new List<OnboardingTaskTemplate>();
    }

    /// <summary>
    /// Template for individual onboarding tasks
    /// </summary>
    public class OnboardingTaskTemplate : BaseEntity
    {
        public int OnboardingTemplateId { get; set; }
        public OnboardingTemplate Template { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;  // Documentation, Training, Setup, etc.
        public int Order { get; set; }
        public int EstimatedDays { get; set; }
        public bool IsRequired { get; set; }
        public string? AssignedToRole { get; set; }
    }

    /// <summary>
    /// Instance of onboarding for an employee
    /// </summary>
    public class OnboardingProcess : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int EmployeeId { get; set; }
        public User Employee { get; set; } = null!;

        public int TemplateId { get; set; }
        public OnboardingTemplate Template { get; set; } = null!;

        public DateTime StartDate { get; set; }
        public DateTime? TargetCompletionDate { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Status { get; set; } = "InProgress";  // InProgress, Completed, Overdue
        public int Progress { get; set; }  // Percentage

        public int AssignedToUserId { get; set; }  // HR/Manager responsible
        public User AssignedToUser { get; set; } = null!;

        public ICollection<OnboardingTask> Tasks { get; set; } = new List<OnboardingTask>();
    }

    /// <summary>
    /// Individual task in an onboarding process
    /// </summary>
    public class OnboardingTask : BaseEntity
    {
        public int OnboardingProcessId { get; set; }
        public OnboardingProcess Process { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public int Order { get; set; }
        public string Status { get; set; } = "Pending";  // Pending, InProgress, Completed, Skipped
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }

        public int? CompletedByUserId { get; set; }
        public User? CompletedByUser { get; set; }
        public string? Notes { get; set; }

        public ICollection<OnboardingTaskDocument> RequiredDocuments { get; set; } = new List<OnboardingTaskDocument>();
    }

    /// <summary>
    /// Documents required for a task
    /// </summary>
    public class OnboardingTaskDocument : BaseEntity
    {
        public int OnboardingTaskId { get; set; }
        public OnboardingTask Task { get; set; } = null!;

        public string DocumentName { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsUploaded { get; set; }
        public string? FilePath { get; set; }
        public DateTime? UploadedAt { get; set; }
    }

    #endregion

    #region Disciplinary Actions Tracking

    /// <summary>
    /// Types of disciplinary actions
    /// </summary>
    public class DisciplinaryActionType : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public string Name { get; set; } = string.Empty;  // Verbal Warning, Written Warning, Suspension, etc.
        public string? Description { get; set; }
        public int SeverityLevel { get; set; }  // 1-5
        public int? Points { get; set; }  // Points that accumulate
        public int? ValidityPeriodDays { get; set; }  // How long before expiring
        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// Disciplinary action record
    /// </summary>
    public class DisciplinaryAction : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int EmployeeId { get; set; }
        public User Employee { get; set; } = null!;

        public int ActionTypeId { get; set; }
        public DisciplinaryActionType ActionType { get; set; } = null!;

        public string Reason { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime IncidentDate { get; set; }
        public DateTime IssueDate { get; set; }

        public int IssuedByUserId { get; set; }
        public User IssuedByUser { get; set; } = null!;

        public string Status { get; set; } = "Active";  // Active, Appealed, Rescinded, Expired
        public DateTime? ExpiryDate { get; set; }
        public string? DocumentPath { get; set; }

        public ICollection<DisciplinaryAppeal> Appeals { get; set; } = new List<DisciplinaryAppeal>();
    }

    /// <summary>
    /// Appeal against disciplinary action
    /// </summary>
    public class DisciplinaryAppeal : BaseEntity
    {
        public int DisciplinaryActionId { get; set; }
        public DisciplinaryAction Action { get; set; } = null!;

        public string Reason { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Pending";  // Pending, Approved, Rejected

        public int? ReviewedByUserId { get; set; }
        public User? ReviewedByUser { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
    }

    /// <summary>
    /// Summary record for quick lookup
    /// </summary>
    public class EmployeeDisciplinaryRecord : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int EmployeeId { get; set; }
        public User Employee { get; set; } = null!;

        public int TotalPoints { get; set; }
        public int ActiveWarnings { get; set; }
        public DateTime? LastWarningDate { get; set; }
        public DateTime? NextExpiryDate { get; set; }
    }

    #endregion

    #region Skills Matrix

    /// <summary>
    /// Category of skills
    /// </summary>
    public class SkillCategory : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<Skill> Skills { get; set; } = new List<Skill>();
    }

    /// <summary>
    /// Individual skill
    /// </summary>
    public class Skill : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int CategoryId { get; set; }
        public SkillCategory Category { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? MeasurementCriteria { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<EmployeeSkill> EmployeeSkills { get; set; } = new List<EmployeeSkill>();
    }

    /// <summary>
    /// Levels of competency
    /// </summary>
    public class CompetencyLevel : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public string Name { get; set; } = string.Empty;  // Beginner, Intermediate, Advanced, Expert
        public int Level { get; set; }  // 1-5
        public string? Description { get; set; }
        public int Points { get; set; }
    }

    /// <summary>
    /// Employee's skill assessment
    /// </summary>
    public class EmployeeSkill : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int EmployeeId { get; set; }
        public User Employee { get; set; } = null!;

        public int SkillId { get; set; }
        public Skill Skill { get; set; } = null!;

        public int CompetencyLevelId { get; set; }
        public CompetencyLevel CompetencyLevel { get; set; } = null!;

        public DateTime AssessedAt { get; set; }
        public int AssessedByUserId { get; set; }
        public User AssessedByUser { get; set; } = null!;

        public DateTime? ExpiryDate { get; set; }
        public string? Notes { get; set; }

        public int? CertificationId { get; set; }
        public Certification? Certification { get; set; }
    }

    /// <summary>
    /// Required skills for roles/projects
    /// </summary>
    public class SkillRequirement : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public string EntityType { get; set; } = string.Empty;  // Role, Project, Task
        public int EntityId { get; set; }

        public int SkillId { get; set; }
        public Skill Skill { get; set; } = null!;

        public int MinimumCompetencyLevelId { get; set; }
        public CompetencyLevel MinimumCompetencyLevel { get; set; } = null!;

        public bool IsRequired { get; set; }
        public int? NumberOfPeople { get; set; }
    }

    /// <summary>
    /// Cached gap analysis results
    /// </summary>
    public class SkillGapAnalysis : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int EmployeeId { get; set; }
        public User Employee { get; set; } = null!;

        public int SkillId { get; set; }
        public Skill Skill { get; set; } = null!;

        public int CurrentLevel { get; set; }
        public int RequiredLevel { get; set; }
        public int Gap { get; set; }
        public string? RecommendedTraining { get; set; }
        public DateTime AnalyzedAt { get; set; } = DateTime.UtcNow;
    }

    #endregion
}
