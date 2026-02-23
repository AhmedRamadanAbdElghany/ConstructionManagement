using System.Text.Json;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ProjectTaskStatus = ConstructionManagement.Domain.Enums.ProjectTaskStatus;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service implementation for managing project item tasks
/// </summary>
public class TaskManagementService : ITaskManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TaskManagementService> _logger;
    private readonly ITaskNotificationService _notificationService;

    public TaskManagementService(
        ApplicationDbContext context,
        ILogger<TaskManagementService> logger,
        ITaskNotificationService notificationService)
    {
        _context = context;
        _logger = logger;
        _notificationService = notificationService;
    }

    // -- Task CRUD -------------------------------------------------------------
    public async Task<ProjectItemTask> CreateTaskAsync(int companyId, int projectId, int projectItemId,
        string title, string? description, int? assignedToUserId, int createdByUserId,
        TaskPriority priority = TaskPriority.Normal, DateTime? dueDate = null,
        DateTime? scheduledStartDate = null, DateTime? scheduledEndDate = null,
        decimal? estimatedHours = null, bool requiresPreStartConfirmation = false,
        int preStartConfirmationHours = 24)
    {
        // Generate task number
        var taskCount = await _context.ProjectItemTasks
            .Where(t => t.CompanyId == companyId)
            .CountAsync();
        var taskNumber = $"TASK-{(taskCount + 1):D6}";

        var task = new ProjectItemTask
        {
            CompanyId = companyId,
            ProjectId = projectId,
            ProjectItemId = projectItemId,
            TaskNumber = taskNumber,
            Title = title,
            Description = description,
            Status = ProjectTaskStatus.Pending,
            Priority = priority,
            AssignedToUserId = assignedToUserId,
            CreatedByUserId = createdByUserId,
            DueDate = dueDate,
            ScheduledStartDate = scheduledStartDate,
            ScheduledEndDate = scheduledEndDate,
            EstimatedHours = estimatedHours,
            RequiresPreStartConfirmation = requiresPreStartConfirmation,
            PreStartConfirmationHours = preStartConfirmationHours,
            PreStartConfirmationStatus = requiresPreStartConfirmation ? ConfirmationStatus.Pending : ConfirmationStatus.Confirmed
        };

        _context.ProjectItemTasks.Add(task);
        await _context.SaveChangesAsync();

        // Add history entry
        await AddHistoryEntryAsync(task.Id, TaskHistoryAction.Created, createdByUserId,
            notes: $"Task '{title}' created");

        // Send notification if assigned
        if (assignedToUserId.HasValue)
        {
            await _notificationService.SendTaskAssignedNotificationAsync(task, createdByUserId);
        }

        _logger.LogInformation("Task {TaskNumber} created for project item {ProjectItemId}", taskNumber, projectItemId);
        return task;
    }

    public async Task<ProjectItemTask?> GetTaskByIdAsync(int taskId)
    {
        return await _context.ProjectItemTasks
            .Include(t => t.Project)
            .Include(t => t.ProjectItem)
            .Include(t => t.AssignedToUser)
            .Include(t => t.CreatedByUser)
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync(t => t.Id == taskId);
    }

    public async Task<ProjectItemTask?> GetTaskByNumberAsync(int companyId, string taskNumber)
    {
        return await _context.ProjectItemTasks
            .Include(t => t.Project)
            .Include(t => t.ProjectItem)
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(t => t.CompanyId == companyId && t.TaskNumber == taskNumber);
    }

    public async Task<IEnumerable<ProjectItemTask>> GetTasksByProjectIdAsync(int projectId)
    {
        return await _context.ProjectItemTasks
            .Include(t => t.ProjectItem)
            .Include(t => t.AssignedToUser)
            .Where(t => t.ProjectId == projectId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectItemTask>> GetTasksByProjectItemIdAsync(int projectItemId)
    {
        return await _context.ProjectItemTasks
            .Include(t => t.AssignedToUser)
            .Where(t => t.ProjectItemId == projectItemId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectItemTask>> GetTasksByAssignedUserAsync(int userId)
    {
        return await _context.ProjectItemTasks
            .Include(t => t.Project)
            .Include(t => t.ProjectItem)
            .Where(t => t.AssignedToUserId == userId)
            .OrderByDescending(t => t.DueDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectItemTask>> GetTasksByStatusAsync(int companyId, ProjectTaskStatus status)
    {
        return await _context.ProjectItemTasks
            .Include(t => t.Project)
            .Include(t => t.ProjectItem)
            .Include(t => t.AssignedToUser)
            .Where(t => t.CompanyId == companyId && t.Status == status)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectItemTask>> GetOverdueTasksAsync(int companyId)
    {
        var now = DateTime.UtcNow;
        return await _context.ProjectItemTasks
            .Include(t => t.Project)
            .Include(t => t.ProjectItem)
            .Include(t => t.AssignedToUser)
            .Where(t => t.CompanyId == companyId &&
                        t.DueDate.HasValue &&
                        t.DueDate.Value < now &&
                        t.Status != ProjectTaskStatus.Approved &&
                        t.Status != ProjectTaskStatus.Cancelled)
            .OrderBy(t => t.DueDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectItemTask>> GetTasksDueSoonAsync(int companyId, int daysThreshold = 3)
    {
        var now = DateTime.UtcNow;
        var threshold = now.AddDays(daysThreshold);
        return await _context.ProjectItemTasks
            .Include(t => t.Project)
            .Include(t => t.ProjectItem)
            .Include(t => t.AssignedToUser)
            .Where(t => t.CompanyId == companyId &&
                        t.DueDate.HasValue &&
                        t.DueDate.Value >= now &&
                        t.DueDate.Value <= threshold &&
                        t.Status != ProjectTaskStatus.Approved &&
                        t.Status != ProjectTaskStatus.Cancelled)
            .OrderBy(t => t.DueDate)
            .ToListAsync();
    }

    public async Task<ProjectItemTask> UpdateTaskAsync(int taskId, string? title = null, string? description = null,
        int? assignedToUserId = null, TaskPriority? priority = null, DateTime? dueDate = null,
        DateTime? scheduledStartDate = null, DateTime? scheduledEndDate = null,
        decimal? estimatedHours = null, decimal? actualHours = null,
        decimal? progressPercentage = null, string? internalNotes = null)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        if (title != null) task.Title = title;
        if (description != null) task.Description = description;
        if (priority.HasValue) task.Priority = priority.Value;
        if (dueDate.HasValue) task.DueDate = dueDate;
        if (scheduledStartDate.HasValue) task.ScheduledStartDate = scheduledStartDate;
        if (scheduledEndDate.HasValue) task.ScheduledEndDate = scheduledEndDate;
        if (estimatedHours.HasValue) task.EstimatedHours = estimatedHours;
        if (actualHours.HasValue) task.ActualHours = actualHours;
        if (progressPercentage.HasValue) task.ProgressPercentage = progressPercentage.Value;
        if (internalNotes != null) task.InternalNotes = internalNotes;

        if (assignedToUserId.HasValue && assignedToUserId != task.AssignedToUserId)
        {
            var oldAssignedUserId = task.AssignedToUserId;
            task.AssignedToUserId = assignedToUserId;
            await _context.SaveChangesAsync();
            
            if (oldAssignedUserId.HasValue)
            {
                await AddHistoryEntryAsync(taskId, TaskHistoryAction.Reassigned, task.CreatedByUserId,
                    "AssignedToUserId", oldAssignedUserId.ToString(), assignedToUserId.ToString());
            }
            else
            {
                await AddHistoryEntryAsync(taskId, TaskHistoryAction.Assigned, task.CreatedByUserId,
                    newValue: assignedToUserId.ToString());
            }
        }
        else
        {
            await _context.SaveChangesAsync();
        }

        return task;
    }

    public async Task DeleteTaskAsync(int taskId)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        _context.ProjectItemTasks.Remove(task);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Task {TaskNumber} deleted", task.TaskNumber);
    }

    // -- Task Workflow ---------------------------------------------------------
    public async Task<ProjectItemTask> StartTaskAsync(int taskId, int startedByUserId)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        if (task.Status != ProjectTaskStatus.Pending && task.Status != ProjectTaskStatus.OnHold)
            throw new InvalidOperationException($"Cannot start task in status {task.Status}");

        var previousStatus = task.Status;
        task.Status = ProjectTaskStatus.InProgress;
        task.ActualStartDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await AddHistoryEntryAsync(taskId, TaskHistoryAction.Started, startedByUserId,
            nameof(TaskStatus), previousStatus.ToString(), ProjectTaskStatus.InProgress.ToString());

        await _notificationService.SendTaskStartedNotificationAsync(task);
        _logger.LogInformation("Task {TaskNumber} started by user {UserId}", task.TaskNumber, startedByUserId);

        return task;
    }

    public async Task<ProjectItemTask> SubmitForReviewAsync(int taskId, string? notes = null)
    {
        var task = await _context.ProjectItemTasks
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync(t => t.Id == taskId);
        
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        if (task.Status != ProjectTaskStatus.InProgress && task.Status != ProjectTaskStatus.RevisionRequested)
            throw new InvalidOperationException($"Cannot submit task in status {task.Status}");

        var previousStatus = task.Status;
        task.Status = ProjectTaskStatus.ReadyForReview;

        await _context.SaveChangesAsync();
        await AddHistoryEntryAsync(taskId, TaskHistoryAction.Completed, task.AssignedToUserId ?? task.CreatedByUserId,
            nameof(TaskStatus), previousStatus.ToString(), ProjectTaskStatus.ReadyForReview.ToString(), notes);

        await _notificationService.SendTaskSubmittedForReviewNotificationAsync(task);
        _logger.LogInformation("Task {TaskNumber} submitted for review", task.TaskNumber);

        return task;
    }

    public async Task<ProjectItemTask> ApproveTaskAsync(int taskId, int reviewerUserId, string? comments = null, int? qualityRating = null)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        if (task.Status != ProjectTaskStatus.ReadyForReview)
            throw new InvalidOperationException($"Cannot approve task in status {task.Status}");

        var previousStatus = task.Status;
        task.Status = ProjectTaskStatus.Approved;
        task.ActualEndDate = DateTime.UtcNow;
        task.ReviewedByUserId = reviewerUserId;
        task.ReviewedAt = DateTime.UtcNow;
        task.ProgressPercentage = 100;

        // Create review record
        var review = new ProjectItemTaskReview
        {
            CompanyId = task.CompanyId,
            ProjectItemTaskId = taskId,
            ReviewType = ReviewType.Approval,
            PreviousStatus = previousStatus,
            NewStatus = ProjectTaskStatus.Approved,
            ReviewerUserId = reviewerUserId,
            Comments = comments,
            QualityRating = qualityRating
        };
        _context.ProjectItemTaskReviews.Add(review);

        await _context.SaveChangesAsync();
        await AddHistoryEntryAsync(taskId, TaskHistoryAction.Approved, reviewerUserId,
            nameof(TaskStatus), previousStatus.ToString(), ProjectTaskStatus.Approved.ToString(), comments);

        await _notificationService.SendTaskApprovedNotificationAsync(task, reviewerUserId);
        _logger.LogInformation("Task {TaskNumber} approved by user {UserId}", task.TaskNumber, reviewerUserId);

        return task;
    }

    public async Task<ProjectItemTask> RejectTaskAsync(int taskId, int reviewerUserId, string? rejectionReason = null)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        if (task.Status != ProjectTaskStatus.ReadyForReview)
            throw new InvalidOperationException($"Cannot reject task in status {task.Status}");

        var previousStatus = task.Status;
        task.Status = ProjectTaskStatus.Rejected;
        task.ReviewedByUserId = reviewerUserId;
        task.ReviewedAt = DateTime.UtcNow;

        // Create review record
        var review = new ProjectItemTaskReview
        {
            CompanyId = task.CompanyId,
            ProjectItemTaskId = taskId,
            ReviewType = ReviewType.Rejection,
            PreviousStatus = previousStatus,
            NewStatus = ProjectTaskStatus.Rejected,
            ReviewerUserId = reviewerUserId,
            RejectionReason = rejectionReason
        };
        _context.ProjectItemTaskReviews.Add(review);

        await _context.SaveChangesAsync();
        await AddHistoryEntryAsync(taskId, TaskHistoryAction.Rejected, reviewerUserId,
            nameof(TaskStatus), previousStatus.ToString(), ProjectTaskStatus.Rejected.ToString(), rejectionReason);

        await _notificationService.SendTaskRejectedNotificationAsync(task, reviewerUserId, rejectionReason);
        _logger.LogInformation("Task {TaskNumber} rejected by user {UserId}", task.TaskNumber, reviewerUserId);

        return task;
    }

    public async Task<ProjectItemTask> RequestRevisionAsync(int taskId, int reviewerUserId, string revisionInstructions)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        if (task.Status != ProjectTaskStatus.ReadyForReview)
            throw new InvalidOperationException($"Cannot request revision for task in status {task.Status}");

        var previousStatus = task.Status;
        task.Status = ProjectTaskStatus.RevisionRequested;

        // Create review record
        var review = new ProjectItemTaskReview
        {
            CompanyId = task.CompanyId,
            ProjectItemTaskId = taskId,
            ReviewType = ReviewType.RevisionRequest,
            PreviousStatus = previousStatus,
            NewStatus = ProjectTaskStatus.RevisionRequested,
            ReviewerUserId = reviewerUserId,
            RevisionInstructions = revisionInstructions
        };
        _context.ProjectItemTaskReviews.Add(review);

        await _context.SaveChangesAsync();
        await AddHistoryEntryAsync(taskId, TaskHistoryAction.RevisionRequested, reviewerUserId,
            nameof(TaskStatus), previousStatus.ToString(), ProjectTaskStatus.RevisionRequested.ToString(), revisionInstructions);

        await _notificationService.SendRevisionRequestedNotificationAsync(task, reviewerUserId, revisionInstructions);
        _logger.LogInformation("Revision requested for task {TaskNumber} by user {UserId}", task.TaskNumber, reviewerUserId);

        return task;
    }

    public async Task<ProjectItemTask> PutTaskOnHoldAsync(int taskId, int userId, string? reason = null)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        if (task.Status != ProjectTaskStatus.Pending && task.Status != ProjectTaskStatus.InProgress)
            throw new InvalidOperationException($"Cannot put task on hold in status {task.Status}");

        var previousStatus = task.Status;
        task.Status = ProjectTaskStatus.OnHold;

        await _context.SaveChangesAsync();
        await AddHistoryEntryAsync(taskId, TaskHistoryAction.PutOnHold, userId,
            nameof(TaskStatus), previousStatus.ToString(), ProjectTaskStatus.OnHold.ToString(), reason);

        await _notificationService.SendTaskOnHoldNotificationAsync(task, reason);
        _logger.LogInformation("Task {TaskNumber} put on hold by user {UserId}", task.TaskNumber, userId);

        return task;
    }

    public async Task<ProjectItemTask> ResumeTaskAsync(int taskId, int userId, string? notes = null)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        if (task.Status != ProjectTaskStatus.OnHold)
            throw new InvalidOperationException($"Cannot resume task in status {task.Status}");

        var previousStatus = task.Status;
        task.Status = ProjectTaskStatus.InProgress;

        await _context.SaveChangesAsync();
        await AddHistoryEntryAsync(taskId, TaskHistoryAction.Resumed, userId,
            nameof(TaskStatus), previousStatus.ToString(), ProjectTaskStatus.InProgress.ToString(), notes);

        await _notificationService.SendTaskResumedNotificationAsync(task);
        _logger.LogInformation("Task {TaskNumber} resumed by user {UserId}", task.TaskNumber, userId);

        return task;
    }

    public async Task<ProjectItemTask> CancelTaskAsync(int taskId, int userId, string? reason = null)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        var previousStatus = task.Status;
        task.Status = ProjectTaskStatus.Cancelled;

        await _context.SaveChangesAsync();
        await AddHistoryEntryAsync(taskId, TaskHistoryAction.Cancelled, userId,
            nameof(TaskStatus), previousStatus.ToString(), ProjectTaskStatus.Cancelled.ToString(), reason);

        await _notificationService.SendTaskCancelledNotificationAsync(task, reason);
        _logger.LogInformation("Task {TaskNumber} cancelled by user {UserId}", task.TaskNumber, userId);

        return task;
    }

    // -- Task Assignment -------------------------------------------------------
    public async Task<ProjectItemTask> AssignTaskAsync(int taskId, int assignedToUserId, int assignedByUserId)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        task.AssignedToUserId = assignedToUserId;
        await _context.SaveChangesAsync();

        await AddHistoryEntryAsync(taskId, TaskHistoryAction.Assigned, assignedByUserId,
            newValue: assignedToUserId.ToString());

        await _notificationService.SendTaskAssignedNotificationAsync(task, assignedByUserId);
        _logger.LogInformation("Task {TaskNumber} assigned to user {UserId}", task.TaskNumber, assignedToUserId);

        return task;
    }

    public async Task<ProjectItemTask> ReassignTaskAsync(int taskId, int newAssignedToUserId, int reassignedByUserId, string? reason = null)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        var oldAssignedUserId = task.AssignedToUserId;
        task.AssignedToUserId = newAssignedToUserId;
        await _context.SaveChangesAsync();

        await AddHistoryEntryAsync(taskId, TaskHistoryAction.Reassigned, reassignedByUserId,
            "AssignedToUserId", oldAssignedUserId?.ToString(), newAssignedToUserId.ToString(), reason);

        await _notificationService.SendTaskAssignedNotificationAsync(task, reassignedByUserId);
        _logger.LogInformation("Task {TaskNumber} reassigned from user {OldUserId} to user {NewUserId}",
            task.TaskNumber, oldAssignedUserId, newAssignedToUserId);

        return task;
    }

    // -- Pre-Start Confirmation ------------------------------------------------
    public async Task<ProjectItemTask> ConfirmPreStartAsync(int taskId, int confirmedByUserId, string? notes = null)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        task.PreStartConfirmationStatus = ConfirmationStatus.Confirmed;
        task.PreStartConfirmedAt = DateTime.UtcNow;
        task.PreStartConfirmedByUserId = confirmedByUserId;
        task.PreStartConfirmationNotes = notes;

        await _context.SaveChangesAsync();
        await AddHistoryEntryAsync(taskId, TaskHistoryAction.PreStartConfirmed, confirmedByUserId, notes: notes);

        await _notificationService.SendPreStartConfirmedNotificationAsync(task, confirmedByUserId);
        _logger.LogInformation("Pre-start confirmed for task {TaskNumber} by user {UserId}", task.TaskNumber, confirmedByUserId);

        return task;
    }

    public async Task<ProjectItemTask> AuthorizeForcedStartAsync(int taskId, int authorizedByUserId, string reason)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        task.PreStartConfirmationStatus = ConfirmationStatus.ForcedStart;
        task.PreStartConfirmedAt = DateTime.UtcNow;
        task.PreStartConfirmedByUserId = authorizedByUserId;
        task.PreStartConfirmationNotes = reason;

        await _context.SaveChangesAsync();
        await AddHistoryEntryAsync(taskId, TaskHistoryAction.ForcedStartAuthorized, authorizedByUserId, notes: reason);

        await _notificationService.SendForcedStartAuthorizedNotificationAsync(task, authorizedByUserId, reason);
        _logger.LogWarning("Forced start authorized for task {TaskNumber} by user {UserId}. Reason: {Reason}",
            task.TaskNumber, authorizedByUserId, reason);

        return task;
    }

    // -- Task Attachments ------------------------------------------------------
    public async Task<ProjectItemTaskAttachment> AddAttachmentAsync(int taskId, string fileName, string filePath,
        long fileSize, string contentType, MediaType mediaType, int uploadedByUserId,
        string? caption = null, string? description = null, decimal? latitude = null,
        decimal? longitude = null, bool isBeforePhoto = false, bool isAfterPhoto = false)
    {
        var task = await _context.ProjectItemTasks.FindAsync(taskId);
        if (task == null)
            throw new InvalidOperationException($"Task with ID {taskId} not found");

        var attachment = new ProjectItemTaskAttachment
        {
            CompanyId = task.CompanyId,
            ProjectItemTaskId = taskId,
            FileName = fileName,
            FilePath = filePath,
            FileSize = fileSize,
            ContentType = contentType,
            MediaType = mediaType,
            UploadedByUserId = uploadedByUserId,
            Caption = caption,
            Description = description,
            Latitude = latitude,
            Longitude = longitude,
            IsBeforePhoto = isBeforePhoto,
            IsAfterPhoto = isAfterPhoto
        };

        _context.ProjectItemTaskAttachments.Add(attachment);
        await _context.SaveChangesAsync();

        await AddHistoryEntryAsync(taskId, TaskHistoryAction.AttachmentAdded, uploadedByUserId,
            newValue: fileName);

        _logger.LogInformation("Attachment {FileName} added to task {TaskNumber}", fileName, task.TaskNumber);
        return attachment;
    }

    public async Task<IEnumerable<ProjectItemTaskAttachment>> GetTaskAttachmentsAsync(int taskId)
    {
        return await _context.ProjectItemTaskAttachments
            .Include(a => a.UploadedByUser)
            .Where(a => a.ProjectItemTaskId == taskId)
            .OrderBy(a => a.SortOrder)
            .ThenByDescending(a => a.UploadedAt)
            .ToListAsync();
    }

    public async Task<ProjectItemTaskAttachment?> GetAttachmentByIdAsync(int attachmentId)
    {
        return await _context.ProjectItemTaskAttachments
            .Include(a => a.Task)
            .Include(a => a.UploadedByUser)
            .FirstOrDefaultAsync(a => a.Id == attachmentId);
    }

    public async Task DeleteAttachmentAsync(int attachmentId)
    {
        var attachment = await _context.ProjectItemTaskAttachments.FindAsync(attachmentId);
        if (attachment == null)
            throw new InvalidOperationException($"Attachment with ID {attachmentId} not found");

        _context.ProjectItemTaskAttachments.Remove(attachment);
        await _context.SaveChangesAsync();

        await AddHistoryEntryAsync(attachment.ProjectItemTaskId, TaskHistoryAction.AttachmentRemoved,
            0, newValue: attachment.FileName);

        _logger.LogInformation("Attachment {FileName} deleted", attachment.FileName);
    }

    // -- Task History ----------------------------------------------------------
    public async Task<IEnumerable<ProjectItemTaskHistory>> GetTaskHistoryAsync(int taskId)
    {
        return await _context.ProjectItemTaskHistories
            .Include(h => h.ChangedByUser)
            .Where(h => h.ProjectItemTaskId == taskId)
            .OrderByDescending(h => h.ChangedAt)
            .ToListAsync();
    }

    public async Task<ProjectItemTaskHistory> AddHistoryEntryAsync(int taskId, TaskHistoryAction action,
        int changedByUserId, string? fieldName = null, string? oldValue = null,
        string? newValue = null, string? notes = null)
    {
        var history = new ProjectItemTaskHistory
        {
            ProjectItemTaskId = taskId,
            Action = action,
            FieldName = fieldName,
            OldValue = oldValue,
            NewValue = newValue,
            ChangedByUserId = changedByUserId,
            Notes = notes
        };

        _context.ProjectItemTaskHistories.Add(history);
        await _context.SaveChangesAsync();
        return history;
    }

    // -- Task Statistics -------------------------------------------------------
    public async Task<Dictionary<ProjectTaskStatus, int>> GetTaskStatusCountsAsync(int projectId)
    {
        var tasks = await _context.ProjectItemTasks
            .Where(t => t.ProjectId == projectId)
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return tasks.ToDictionary(t => t.Status, t => t.Count);
    }

    public async Task<int> GetCompletedTasksCountAsync(int projectId, DateTime? fromDate = null, DateTime? toDate = null)
    {
        var query = _context.ProjectItemTasks
            .Where(t => t.ProjectId == projectId && t.Status == ProjectTaskStatus.Approved);

        if (fromDate.HasValue)
            query = query.Where(t => t.ActualEndDate >= fromDate);
        if (toDate.HasValue)
            query = query.Where(t => t.ActualEndDate <= toDate);

        return await query.CountAsync();
    }

    public async Task<decimal> GetAverageTaskCompletionTimeAsync(int projectId)
    {
        var tasks = await _context.ProjectItemTasks
            .Where(t => t.ProjectId == projectId &&
                        t.Status == ProjectTaskStatus.Approved &&
                        t.ActualStartDate.HasValue &&
                        t.ActualEndDate.HasValue)
            .Select(t => new { t.ActualStartDate, t.ActualEndDate })
            .ToListAsync();

        if (!tasks.Any())
            return 0;

        var totalHours = tasks.Sum(t => (t.ActualEndDate!.Value - t.ActualStartDate!.Value).TotalHours);
        return (decimal)(totalHours / tasks.Count);
    }

    public async Task<IEnumerable<ProjectItemTask>> GetStuckTasksAsync(int companyId, int daysThreshold = 3)
    {
        var threshold = DateTime.UtcNow.AddDays(-daysThreshold);
        return await _context.ProjectItemTasks
            .Include(t => t.Project)
            .Include(t => t.AssignedToUser)
            .Where(t => t.CompanyId == companyId &&
                        t.Status != ProjectTaskStatus.Approved &&
                        t.Status != ProjectTaskStatus.Cancelled &&
                        t.UpdatedAt < threshold)
            .OrderBy(t => t.UpdatedAt)
            .ToListAsync();
    }

    // -- Search & Filter -------------------------------------------------------
    public async Task<IEnumerable<ProjectItemTask>> SearchTasksAsync(int companyId, string searchTerm,
        int? projectId = null, int? projectItemId = null, ProjectTaskStatus? status = null,
        TaskPriority? priority = null, int? assignedToUserId = null, DateTime? dueDateFrom = null,
        DateTime? dueDateTo = null)
    {
        var query = _context.ProjectItemTasks
            .Include(t => t.Project)
            .Include(t => t.ProjectItem)
            .Include(t => t.AssignedToUser)
            .Where(t => t.CompanyId == companyId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(t => t.Title.Contains(searchTerm) ||
                                     (t.Description != null && t.Description.Contains(searchTerm)) ||
                                     t.TaskNumber.Contains(searchTerm));
        }

        if (projectId.HasValue)
            query = query.Where(t => t.ProjectId == projectId);
        if (projectItemId.HasValue)
            query = query.Where(t => t.ProjectItemId == projectItemId);
        if (status.HasValue)
            query = query.Where(t => t.Status == status);
        if (priority.HasValue)
            query = query.Where(t => t.Priority == priority);
        if (assignedToUserId.HasValue)
            query = query.Where(t => t.AssignedToUserId == assignedToUserId);
        if (dueDateFrom.HasValue)
            query = query.Where(t => t.DueDate >= dueDateFrom);
        if (dueDateTo.HasValue)
            query = query.Where(t => t.DueDate <= dueDateTo);

        return await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
    }

    // -- Bulk Operations -------------------------------------------------------
    public async Task<IEnumerable<ProjectItemTask>> BulkAssignAsync(IEnumerable<int> taskIds, int assignedToUserId, int assignedByUserId)
    {
        var tasks = await _context.ProjectItemTasks
            .Where(t => taskIds.Contains(t.Id))
            .ToListAsync();

        foreach (var task in tasks)
        {
            task.AssignedToUserId = assignedToUserId;
        }

        await _context.SaveChangesAsync();

        foreach (var task in tasks)
        {
            await AddHistoryEntryAsync(task.Id, TaskHistoryAction.Assigned, assignedByUserId,
                newValue: assignedToUserId.ToString());
            await _notificationService.SendTaskAssignedNotificationAsync(task, assignedByUserId);
        }

        _logger.LogInformation("Bulk assigned {Count} tasks to user {UserId}", tasks.Count, assignedToUserId);
        return tasks;
    }

    public async Task<IEnumerable<ProjectItemTask>> BulkUpdateStatusAsync(IEnumerable<int> taskIds, ProjectTaskStatus newStatus, int updatedByUserId)
    {
        var tasks = await _context.ProjectItemTasks
            .Where(t => taskIds.Contains(t.Id))
            .ToListAsync();

        foreach (var task in tasks)
        {
            var previousStatus = task.Status;
            task.Status = newStatus;
            await AddHistoryEntryAsync(task.Id, TaskHistoryAction.StatusChanged, updatedByUserId,
                nameof(TaskStatus), previousStatus.ToString(), newStatus.ToString());
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Bulk updated {Count} tasks to status {Status}", tasks.Count, newStatus);
        return tasks;
    }

    public async Task<IEnumerable<ProjectItemTask>> BulkUpdatePriorityAsync(IEnumerable<int> taskIds, TaskPriority newPriority, int updatedByUserId)
    {
        var tasks = await _context.ProjectItemTasks
            .Where(t => taskIds.Contains(t.Id))
            .ToListAsync();

        foreach (var task in tasks)
        {
            var previousPriority = task.Priority;
            task.Priority = newPriority;
            await AddHistoryEntryAsync(task.Id, TaskHistoryAction.PriorityChanged, updatedByUserId,
                nameof(TaskPriority), previousPriority.ToString(), newPriority.ToString());
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Bulk updated {Count} tasks to priority {Priority}", tasks.Count, newPriority);
        return tasks;
    }
}
