using System;
using System.Collections.Generic;

namespace ConstructionManagement.Application.DTOs
{
    #region Employee Documents Management DTOs

    public class EmployeeDocumentCategoryDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool HasExpiry { get; set; }
        public int? ExpiryAlertDays { get; set; }
        public bool IsRequired { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public int DocumentCount { get; set; }
    }

    public class CreateDocumentCategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool HasExpiry { get; set; }
        public int? ExpiryAlertDays { get; set; }
        public bool IsRequired { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class UpdateDocumentCategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool HasExpiry { get; set; }
        public int? ExpiryAlertDays { get; set; }
        public bool IsRequired { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class EmployeeDocumentDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string MimeType { get; set; } = string.Empty;
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string Status { get; set; } = "Active";
        public bool IsVerified { get; set; }
        public int? VerifiedByUserId { get; set; }
        public string? VerifiedByName { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public int UploadedByUserId { get; set; }
        public string UploadedByName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int VersionCount { get; set; }
        public bool IsExpiringSoon { get; set; }
        public int? DaysUntilExpiry { get; set; }
    }

    public class CreateEmployeeDocumentRequest
    {
        public int EmployeeId { get; set; }
        public int CategoryId { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class UpdateEmployeeDocumentRequest
    {
        public string DocumentName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string Status { get; set; } = "Active";
    }

    public class VerifyDocumentRequest
    {
        public bool IsVerified { get; set; }
        public string? Notes { get; set; }
    }

    public class EmployeeDocumentVersionDto
    {
        public int Id { get; set; }
        public int Version { get; set; }
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string? ChangeNotes { get; set; }
        public string UploadedByName { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }

    public class DocumentExpiryAlertDto
    {
        public int Id { get; set; }
        public int DocumentId { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public int DaysUntilExpiry { get; set; }
        public string AlertType { get; set; } = string.Empty;
        public bool IsSent { get; set; }
        public DateTime? SentAt { get; set; }
    }

    public class ExpiringDocumentsReport
    {
        public int TotalExpiring { get; set; }
        public int ExpiringIn7Days { get; set; }
        public int ExpiringIn30Days { get; set; }
        public int Expired { get; set; }
        public List<DocumentExpiryAlertDto> Documents { get; set; } = new();
    }

    #endregion

    #region Worker Self-Service Portal DTOs

    public class WorkerProfileUpdateRequestDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int WorkerId { get; set; }
        public string WorkerName { get; set; } = string.Empty;
        public string FieldName { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string Status { get; set; } = "Pending";
        public int? ReviewedByUserId { get; set; }
        public string? ReviewedByName { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProfileUpdateRequest
    {
        public string FieldName { get; set; } = string.Empty;
        public string? NewValue { get; set; }
    }

    public class ReviewProfileUpdateRequest
    {
        public bool Approve { get; set; }
        public string? Notes { get; set; }
    }

    public class EmergencyContactDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Relationship { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? AlternativePhone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class CreateEmergencyContactRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Relationship { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? AlternativePhone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class UpdateEmergencyContactRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Relationship { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? AlternativePhone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class BankAccountDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int UserId { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public string? IBAN { get; set; }
        public string? BranchCode { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateBankAccountRequest
    {
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public string? IBAN { get; set; }
        public string? BranchCode { get; set; }
    }

    public class UpdateBankAccountRequest
    {
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public string? IBAN { get; set; }
        public string? BranchCode { get; set; }
        public bool IsActive { get; set; }
    }

    public class WorkerProfileDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? ProfilePicture { get; set; }
        public List<EmergencyContactDto> EmergencyContacts { get; set; } = new();
        public List<BankAccountDto> BankAccounts { get; set; } = new();
        public List<WorkerProfileUpdateRequestDto> PendingRequests { get; set; } = new();
    }

    #endregion

    #region Employee Onboarding Workflow DTOs

    public class OnboardingTemplateDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public int? RoleId { get; set; }
        public string? RoleName { get; set; }
        public int EstimatedDays { get; set; }
        public bool IsActive { get; set; }
        public int TaskCount { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateOnboardingTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? DepartmentId { get; set; }
        public int? RoleId { get; set; }
        public int EstimatedDays { get; set; }
        public List<CreateTaskTemplateRequest> Tasks { get; set; } = new();
    }

    public class UpdateOnboardingTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? DepartmentId { get; set; }
        public int? RoleId { get; set; }
        public int EstimatedDays { get; set; }
        public bool IsActive { get; set; }
    }

    public class OnboardingTaskTemplateDto
    {
        public int Id { get; set; }
        public int OnboardingTemplateId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public int Order { get; set; }
        public int EstimatedDays { get; set; }
        public bool IsRequired { get; set; }
        public string? AssignedToRole { get; set; }
    }

    public class CreateTaskTemplateRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public int Order { get; set; }
        public int EstimatedDays { get; set; }
        public bool IsRequired { get; set; }
        public string? AssignedToRole { get; set; }
    }

    public class OnboardingProcessDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int TemplateId { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? TargetCompletionDate { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Status { get; set; } = "InProgress";
        public int Progress { get; set; }
        public int AssignedToUserId { get; set; }
        public string AssignedToName { get; set; } = string.Empty;
        public List<OnboardingTaskDto> Tasks { get; set; } = new();
    }

    public class CreateOnboardingProcessRequest
    {
        public int EmployeeId { get; set; }
        public int TemplateId { get; set; }
        public DateTime StartDate { get; set; }
        public int AssignedToUserId { get; set; }
    }

    public class OnboardingTaskDto
    {
        public int Id { get; set; }
        public int OnboardingProcessId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public int Order { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? CompletedByUserId { get; set; }
        public string? CompletedByName { get; set; }
        public string? Notes { get; set; }
        public List<OnboardingTaskDocumentDto> RequiredDocuments { get; set; } = new();
    }

    public class UpdateOnboardingTaskRequest
    {
        public string Status { get; set; } = "Pending";
        public string? Notes { get; set; }
    }

    public class OnboardingTaskDocumentDto
    {
        public int Id { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsUploaded { get; set; }
        public string? FilePath { get; set; }
        public DateTime? UploadedAt { get; set; }
    }

    public class OnboardingDashboardDto
    {
        public int TotalInProgress { get; set; }
        public int CompletedThisMonth { get; set; }
        public int Overdue { get; set; }
        public double AverageCompletionDays { get; set; }
        public List<OnboardingProcessDto> RecentProcesses { get; set; } = new();
    }

    #endregion

    #region Disciplinary Actions Tracking DTOs

    public class DisciplinaryActionTypeDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int SeverityLevel { get; set; }
        public int? Points { get; set; }
        public int? ValidityPeriodDays { get; set; }
        public bool IsActive { get; set; }
        public int UsageCount { get; set; }
    }

    public class CreateDisciplinaryActionTypeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int SeverityLevel { get; set; }
        public int? Points { get; set; }
        public int? ValidityPeriodDays { get; set; }
    }

    public class UpdateDisciplinaryActionTypeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int SeverityLevel { get; set; }
        public int? Points { get; set; }
        public int? ValidityPeriodDays { get; set; }
        public bool IsActive { get; set; }
    }

    public class DisciplinaryActionDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int ActionTypeId { get; set; }
        public string ActionTypeName { get; set; } = string.Empty;
        public int SeverityLevel { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime IncidentDate { get; set; }
        public DateTime IssueDate { get; set; }
        public int IssuedByUserId { get; set; }
        public string IssuedByName { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public DateTime? ExpiryDate { get; set; }
        public string? DocumentPath { get; set; }
        public bool HasAppeal { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateDisciplinaryActionRequest
    {
        public int EmployeeId { get; set; }
        public int ActionTypeId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime IncidentDate { get; set; }
        public DateTime IssueDate { get; set; }
    }

    public class UpdateDisciplinaryActionRequest
    {
        public string Reason { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "Active";
    }

    public class DisciplinaryAppealDto
    {
        public int Id { get; set; }
        public int DisciplinaryActionId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = "Pending";
        public int? ReviewedByUserId { get; set; }
        public string? ReviewedByName { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
    }

    public class CreateDisciplinaryAppealRequest
    {
        public int DisciplinaryActionId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class ReviewAppealRequest
    {
        public bool Approve { get; set; }
        public string? Notes { get; set; }
    }

    public class EmployeeDisciplinaryRecordDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int TotalPoints { get; set; }
        public int ActiveWarnings { get; set; }
        public DateTime? LastWarningDate { get; set; }
        public DateTime? NextExpiryDate { get; set; }
        public List<DisciplinaryActionDto> RecentActions { get; set; } = new();
    }

    public class DisciplinaryDashboardDto
    {
        public int TotalActiveActions { get; set; }
        public int PendingAppeals { get; set; }
        public int ActionsThisMonth { get; set; }
        public int ExpiringThisMonth { get; set; }
        public List<DisciplinaryActionDto> RecentActions { get; set; } = new();
    }

    #endregion

    #region Skills Matrix DTOs

    public class SkillCategoryDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public int SkillCount { get; set; }
    }

    public class CreateSkillCategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class UpdateSkillCategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class SkillDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? MeasurementCriteria { get; set; }
        public bool IsActive { get; set; }
        public int EmployeeCount { get; set; }
    }

    public class CreateSkillRequest
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? MeasurementCriteria { get; set; }
    }

    public class UpdateSkillRequest
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? MeasurementCriteria { get; set; }
        public bool IsActive { get; set; }
    }

    public class CompetencyLevelDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Level { get; set; }
        public string? Description { get; set; }
        public int Points { get; set; }
    }

    public class CreateCompetencyLevelRequest
    {
        public string Name { get; set; } = string.Empty;
        public int Level { get; set; }
        public string? Description { get; set; }
        public int Points { get; set; }
    }

    public class UpdateCompetencyLevelRequest
    {
        public string Name { get; set; } = string.Empty;
        public int Level { get; set; }
        public string? Description { get; set; }
        public int Points { get; set; }
    }

    public class EmployeeSkillDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int SkillId { get; set; }
        public string SkillName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int CompetencyLevelId { get; set; }
        public string CompetencyLevelName { get; set; } = string.Empty;
        public int CompetencyLevel { get; set; }
        public DateTime AssessedAt { get; set; }
        public string AssessedByName { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public string? Notes { get; set; }
        public int? CertificationId { get; set; }
        public string? CertificationName { get; set; }
    }

    public class CreateEmployeeSkillRequest
    {
        public int EmployeeId { get; set; }
        public int SkillId { get; set; }
        public int CompetencyLevelId { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? Notes { get; set; }
        public int? CertificationId { get; set; }
    }

    public class UpdateEmployeeSkillRequest
    {
        public int CompetencyLevelId { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? Notes { get; set; }
        public int? CertificationId { get; set; }
    }

    public class SkillRequirementDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public string? EntityName { get; set; }
        public int SkillId { get; set; }
        public string SkillName { get; set; } = string.Empty;
        public int MinimumCompetencyLevelId { get; set; }
        public string MinimumCompetencyLevelName { get; set; } = string.Empty;
        public int MinimumLevel { get; set; }
        public bool IsRequired { get; set; }
        public int? NumberOfPeople { get; set; }
    }

    public class CreateSkillRequirementRequest
    {
        public string EntityType { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public int SkillId { get; set; }
        public int MinimumCompetencyLevelId { get; set; }
        public bool IsRequired { get; set; }
        public int? NumberOfPeople { get; set; }
    }

    public class SkillGapAnalysisDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int SkillId { get; set; }
        public string SkillName { get; set; } = string.Empty;
        public int CurrentLevel { get; set; }
        public int RequiredLevel { get; set; }
        public int Gap { get; set; }
        public string? RecommendedTraining { get; set; }
        public DateTime AnalyzedAt { get; set; }
    }

    public class EmployeeSkillsProfileDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int TotalSkills { get; set; }
        public int AverageLevel { get; set; }
        public List<EmployeeSkillDto> Skills { get; set; } = new();
        public List<SkillGapAnalysisDto> Gaps { get; set; } = new();
    }

    public class SkillsMatrixDashboardDto
    {
        public int TotalSkills { get; set; }
        public int TotalCategories { get; set; }
        public int TotalAssessments { get; set; }
        public int EmployeesWithSkills { get; set; }
        public int IdentifiedGaps { get; set; }
        public List<SkillCategoryDto> Categories { get; set; } = new();
        public List<SkillGapAnalysisDto> TopGaps { get; set; } = new();
    }

    #endregion
}
