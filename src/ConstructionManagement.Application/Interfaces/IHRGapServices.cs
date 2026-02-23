using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    #region Employee Documents Management Service

    public interface IEmployeeDocumentService
    {
        // Categories
        Task<List<EmployeeDocumentCategoryDto>> GetCategoriesAsync(int? companyId);
        Task<EmployeeDocumentCategoryDto> GetCategoryByIdAsync(int id);
        Task<EmployeeDocumentCategoryDto> CreateCategoryAsync(CreateDocumentCategoryRequest request, int? companyId, int userId);
        Task<EmployeeDocumentCategoryDto> UpdateCategoryAsync(int id, UpdateDocumentCategoryRequest request);
        Task DeleteCategoryAsync(int id);

        // Documents
        Task<List<EmployeeDocumentDto>> GetDocumentsAsync(int? companyId, int? employeeId = null, int? categoryId = null, string? status = null);
        Task<EmployeeDocumentDto> GetDocumentByIdAsync(int id);
        Task<EmployeeDocumentDto> UploadDocumentAsync(CreateEmployeeDocumentRequest request, byte[] fileData, string fileName, string mimeType, int? companyId, int userId);
        Task<EmployeeDocumentDto> UpdateDocumentAsync(int id, UpdateEmployeeDocumentRequest request);
        Task DeleteDocumentAsync(int id);
        Task<EmployeeDocumentDto> UploadNewVersionAsync(int documentId, byte[] fileData, string fileName, string mimeType, string? changeNotes, int userId);
        Task<List<EmployeeDocumentVersionDto>> GetDocumentVersionsAsync(int documentId);
        Task<EmployeeDocumentDto> VerifyDocumentAsync(int id, VerifyDocumentRequest request, int userId);
        Task<byte[]> DownloadDocumentAsync(int id);

        // Expiry Alerts
        Task<List<DocumentExpiryAlertDto>> GetExpiringDocumentsAsync(int? companyId, int daysThreshold = 30);
        Task<ExpiringDocumentsReport> GetExpiryReportAsync(int? companyId);
        Task ProcessExpiryAlertsAsync();
    }

    #endregion

    #region Worker Self-Service Service

    public interface IWorkerSelfServiceService
    {
        // Profile
        Task<WorkerProfileDto> GetProfileAsync(int userId);
        Task<WorkerProfileUpdateRequestDto> RequestProfileUpdateAsync(int userId, CreateProfileUpdateRequest request, int? companyId);
        Task<List<WorkerProfileUpdateRequestDto>> GetPendingProfileUpdatesAsync(int? companyId);
        Task<WorkerProfileUpdateRequestDto> ReviewProfileUpdateAsync(int id, ReviewProfileUpdateRequest request, int reviewerId);

        // Emergency Contacts
        Task<List<EmergencyContactDto>> GetEmergencyContactsAsync(int userId);
        Task<EmergencyContactDto> AddEmergencyContactAsync(int userId, CreateEmergencyContactRequest request, int? companyId);
        Task<EmergencyContactDto> UpdateEmergencyContactAsync(int id, UpdateEmergencyContactRequest request);
        Task DeleteEmergencyContactAsync(int id, int userId);
        Task SetPrimaryEmergencyContactAsync(int id, int userId);

        // Bank Accounts
        Task<List<BankAccountDto>> GetBankAccountsAsync(int userId);
        Task<BankAccountDto> AddBankAccountAsync(int userId, CreateBankAccountRequest request, int? companyId);
        Task<BankAccountDto> UpdateBankAccountAsync(int id, UpdateBankAccountRequest request);
        Task DeleteBankAccountAsync(int id, int userId);
        Task SetActiveBankAccountAsync(int id, int userId);
    }

    #endregion

    #region Employee Onboarding Service

    public interface IEmployeeOnboardingService
    {
        // Templates
        Task<List<OnboardingTemplateDto>> GetTemplatesAsync(int? companyId, bool? isActive = null);
        Task<OnboardingTemplateDto> GetTemplateByIdAsync(int id);
        Task<OnboardingTemplateDto> CreateTemplateAsync(CreateOnboardingTemplateRequest request, int? companyId, int userId);
        Task<OnboardingTemplateDto> UpdateTemplateAsync(int id, UpdateOnboardingTemplateRequest request);
        Task DeleteTemplateAsync(int id);

        // Task Templates
        Task<List<OnboardingTaskTemplateDto>> GetTaskTemplatesAsync(int templateId);
        Task<OnboardingTaskTemplateDto> AddTaskTemplateAsync(int templateId, CreateTaskTemplateRequest request);
        Task<OnboardingTaskTemplateDto> UpdateTaskTemplateAsync(int id, CreateTaskTemplateRequest request);
        Task DeleteTaskTemplateAsync(int id);
        Task ReorderTaskTemplatesAsync(int templateId, List<int> taskIds);

        // Processes
        Task<List<OnboardingProcessDto>> GetProcessesAsync(int? companyId, string? status = null, int? employeeId = null);
        Task<OnboardingProcessDto> GetProcessByIdAsync(int id);
        Task<OnboardingProcessDto> StartOnboardingAsync(CreateOnboardingProcessRequest request, int? companyId);
        Task<OnboardingProcessDto> UpdateProcessProgressAsync(int id);
        Task CompleteOnboardingAsync(int id);

        // Tasks
        Task<List<OnboardingTaskDto>> GetProcessTasksAsync(int processId);
        Task<OnboardingTaskDto> UpdateTaskStatusAsync(int taskId, UpdateOnboardingTaskRequest request, int? userId);
        Task<OnboardingTaskDto> UploadTaskDocumentAsync(int taskId, string documentName, string filePath);

        // Dashboard
        Task<OnboardingDashboardDto> GetDashboardAsync(int? companyId);
    }

    #endregion

    #region Disciplinary Actions Service

    public interface IDisciplinaryActionService
    {
        // Action Types
        Task<List<DisciplinaryActionTypeDto>> GetActionTypesAsync(int? companyId, bool? isActive = null);
        Task<DisciplinaryActionTypeDto> GetActionTypeByIdAsync(int id);
        Task<DisciplinaryActionTypeDto> CreateActionTypeAsync(CreateDisciplinaryActionTypeRequest request, int? companyId);
        Task<DisciplinaryActionTypeDto> UpdateActionTypeAsync(int id, UpdateDisciplinaryActionTypeRequest request);
        Task DeleteActionTypeAsync(int id);

        // Actions
        Task<List<DisciplinaryActionDto>> GetActionsAsync(int? companyId, int? employeeId = null, string? status = null);
        Task<DisciplinaryActionDto> GetActionByIdAsync(int id);
        Task<DisciplinaryActionDto> CreateActionAsync(CreateDisciplinaryActionRequest request, int? companyId, int issuedByUserId);
        Task<DisciplinaryActionDto> UpdateActionAsync(int id, UpdateDisciplinaryActionRequest request);
        Task DeleteActionAsync(int id);
        Task<DisciplinaryActionDto> AttachDocumentAsync(int id, string documentPath);

        // Appeals
        Task<DisciplinaryAppealDto> SubmitAppealAsync(CreateDisciplinaryAppealRequest request);
        Task<DisciplinaryAppealDto> ReviewAppealAsync(int appealId, ReviewAppealRequest request, int reviewerId);
        Task<List<DisciplinaryAppealDto>> GetPendingAppealsAsync(int? companyId);

        // Records
        Task<EmployeeDisciplinaryRecordDto> GetEmployeeRecordAsync(int employeeId);
        Task<List<EmployeeDisciplinaryRecordDto>> GetEmployeeRecordsAsync(int? companyId);

        // Dashboard
        Task<DisciplinaryDashboardDto> GetDashboardAsync(int? companyId);

        // Maintenance
        Task ProcessExpiredActionsAsync();
    }

    #endregion

    #region Skills Matrix Service

    public interface ISkillsMatrixService
    {
        // Categories
        Task<List<SkillCategoryDto>> GetCategoriesAsync(int? companyId, bool? isActive = null);
        Task<SkillCategoryDto> GetCategoryByIdAsync(int id);
        Task<SkillCategoryDto> CreateCategoryAsync(CreateSkillCategoryRequest request, int? companyId);
        Task<SkillCategoryDto> UpdateCategoryAsync(int id, UpdateSkillCategoryRequest request);
        Task DeleteCategoryAsync(int id);

        // Skills
        Task<List<SkillDto>> GetSkillsAsync(int? companyId, int? categoryId = null, bool? isActive = null);
        Task<SkillDto> GetSkillByIdAsync(int id);
        Task<SkillDto> CreateSkillAsync(CreateSkillRequest request, int? companyId);
        Task<SkillDto> UpdateSkillAsync(int id, UpdateSkillRequest request);
        Task DeleteSkillAsync(int id);

        // Competency Levels
        Task<List<CompetencyLevelDto>> GetCompetencyLevelsAsync(int? companyId);
        Task<CompetencyLevelDto> CreateCompetencyLevelAsync(CreateCompetencyLevelRequest request, int? companyId);
        Task<CompetencyLevelDto> UpdateCompetencyLevelAsync(int id, UpdateCompetencyLevelRequest request);
        Task DeleteCompetencyLevelAsync(int id);

        // Employee Skills
        Task<List<EmployeeSkillDto>> GetEmployeeSkillsAsync(int employeeId);
        Task<EmployeeSkillDto> GetEmployeeSkillByIdAsync(int id);
        Task<EmployeeSkillDto> AssessEmployeeSkillAsync(CreateEmployeeSkillRequest request, int? companyId, int assessedByUserId);
        Task<EmployeeSkillDto> UpdateEmployeeSkillAsync(int id, UpdateEmployeeSkillRequest request);
        Task DeleteEmployeeSkillAsync(int id);
        Task<EmployeeSkillsProfileDto> GetEmployeeSkillsProfileAsync(int employeeId);

        // Skill Requirements
        Task<List<SkillRequirementDto>> GetSkillRequirementsAsync(string entityType, int entityId);
        Task<SkillRequirementDto> AddSkillRequirementAsync(CreateSkillRequirementRequest request, int? companyId);
        Task DeleteSkillRequirementAsync(int id);

        // Gap Analysis
        Task<List<SkillGapAnalysisDto>> GetSkillGapsAsync(int? companyId, int? employeeId = null);
        Task<List<SkillGapAnalysisDto>> AnalyzeEmployeeGapsAsync(int employeeId);
        Task<List<SkillGapAnalysisDto>> AnalyzeProjectGapsAsync(int projectId);
        Task<SkillsMatrixDashboardDto> GetDashboardAsync(int? companyId);

        // Bulk Operations
        Task BulkAssessSkillsAsync(int employeeId, List<CreateEmployeeSkillRequest> requests, int? companyId, int assessedByUserId);
        Task<List<EmployeeSkillDto>> FindEmployeesWithSkillAsync(int skillId, int minimumLevel);
    }

    #endregion
}
