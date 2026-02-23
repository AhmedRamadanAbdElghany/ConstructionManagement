using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service interface for managing project item tasks
/// </summary>
public interface ITaskManagementService
{
    // -- Task CRUD -------------------------------------------------------------
    Task<ProjectItemTask> CreateTaskAsync(int companyId, int projectId, int projectItemId, 
        string title, string? description, int? assignedToUserId, int createdByUserId,
        TaskPriority priority = TaskPriority.Normal, DateTime? dueDate = null,
        DateTime? scheduledStartDate = null, DateTime? scheduledEndDate = null,
        decimal? estimatedHours = null, bool requiresPreStartConfirmation = false,
        int preStartConfirmationHours = 24);
    
    Task<ProjectItemTask?> GetTaskByIdAsync(int taskId);
    Task<ProjectItemTask?> GetTaskByNumberAsync(int companyId, string taskNumber);
    Task<IEnumerable<ProjectItemTask>> GetTasksByProjectIdAsync(int projectId);
    Task<IEnumerable<ProjectItemTask>> GetTasksByProjectItemIdAsync(int projectItemId);
    Task<IEnumerable<ProjectItemTask>> GetTasksByAssignedUserAsync(int userId);
    Task<IEnumerable<ProjectItemTask>> GetTasksByStatusAsync(int companyId, Domain.Enums.ProjectTaskStatus status);
    Task<IEnumerable<ProjectItemTask>> GetOverdueTasksAsync(int companyId);
    Task<IEnumerable<ProjectItemTask>> GetTasksDueSoonAsync(int companyId, int daysThreshold = 3);
    
    Task<ProjectItemTask> UpdateTaskAsync(int taskId, string? title = null, string? description = null,
        int? assignedToUserId = null, TaskPriority? priority = null, DateTime? dueDate = null,
        DateTime? scheduledStartDate = null, DateTime? scheduledEndDate = null,
        decimal? estimatedHours = null, decimal? actualHours = null,
        decimal? progressPercentage = null, string? internalNotes = null);
    
    Task DeleteTaskAsync(int taskId);
    
    // -- Task Workflow ---------------------------------------------------------
    Task<ProjectItemTask> StartTaskAsync(int taskId, int startedByUserId);
    Task<ProjectItemTask> SubmitForReviewAsync(int taskId, string? notes = null);
    Task<ProjectItemTask> ApproveTaskAsync(int taskId, int reviewerUserId, string? comments = null, int? qualityRating = null);
    Task<ProjectItemTask> RejectTaskAsync(int taskId, int reviewerUserId, string? rejectionReason = null);
    Task<ProjectItemTask> RequestRevisionAsync(int taskId, int reviewerUserId, string revisionInstructions);
    Task<ProjectItemTask> PutTaskOnHoldAsync(int taskId, int userId, string? reason = null);
    Task<ProjectItemTask> ResumeTaskAsync(int taskId, int userId, string? notes = null);
    Task<ProjectItemTask> CancelTaskAsync(int taskId, int userId, string? reason = null);
    
    // -- Task Assignment -------------------------------------------------------
    Task<ProjectItemTask> AssignTaskAsync(int taskId, int assignedToUserId, int assignedByUserId);
    Task<ProjectItemTask> ReassignTaskAsync(int taskId, int newAssignedToUserId, int reassignedByUserId, string? reason = null);
    
    // -- Pre-Start Confirmation ------------------------------------------------
    Task<ProjectItemTask> ConfirmPreStartAsync(int taskId, int confirmedByUserId, string? notes = null);
    Task<ProjectItemTask> AuthorizeForcedStartAsync(int taskId, int authorizedByUserId, string reason);
    
    // -- Task Attachments ------------------------------------------------------
    Task<ProjectItemTaskAttachment> AddAttachmentAsync(int taskId, string fileName, string filePath,
        long fileSize, string contentType, MediaType mediaType, int uploadedByUserId,
        string? caption = null, string? description = null, decimal? latitude = null,
        decimal? longitude = null, bool isBeforePhoto = false, bool isAfterPhoto = false);
    
    Task<IEnumerable<ProjectItemTaskAttachment>> GetTaskAttachmentsAsync(int taskId);
    Task<ProjectItemTaskAttachment?> GetAttachmentByIdAsync(int attachmentId);
    Task DeleteAttachmentAsync(int attachmentId);
    
    // -- Task History ----------------------------------------------------------
    Task<IEnumerable<ProjectItemTaskHistory>> GetTaskHistoryAsync(int taskId);
    Task<ProjectItemTaskHistory> AddHistoryEntryAsync(int taskId, TaskHistoryAction action,
        int changedByUserId, string? fieldName = null, string? oldValue = null,
        string? newValue = null, string? notes = null);
    
    // -- Task Statistics -------------------------------------------------------
    Task<Dictionary<Domain.Enums.ProjectTaskStatus, int>> GetTaskStatusCountsAsync(int projectId);
    Task<int> GetCompletedTasksCountAsync(int projectId, DateTime? fromDate = null, DateTime? toDate = null);
    Task<decimal> GetAverageTaskCompletionTimeAsync(int projectId);
    Task<IEnumerable<ProjectItemTask>> GetStuckTasksAsync(int companyId, int daysThreshold = 3);
    
    // -- Search & Filter -------------------------------------------------------
    Task<IEnumerable<ProjectItemTask>> SearchTasksAsync(int companyId, string searchTerm,
        int? projectId = null, int? projectItemId = null, Domain.Enums.ProjectTaskStatus? status = null,
        TaskPriority? priority = null, int? assignedToUserId = null, DateTime? dueDateFrom = null,
        DateTime? dueDateTo = null);
    
    // -- Bulk Operations -------------------------------------------------------
    Task<IEnumerable<ProjectItemTask>> BulkAssignAsync(IEnumerable<int> taskIds, int assignedToUserId, int assignedByUserId);
    Task<IEnumerable<ProjectItemTask>> BulkUpdateStatusAsync(IEnumerable<int> taskIds, Domain.Enums.ProjectTaskStatus newStatus, int updatedByUserId);
    Task<IEnumerable<ProjectItemTask>> BulkUpdatePriorityAsync(IEnumerable<int> taskIds, TaskPriority newPriority, int updatedByUserId);
}
