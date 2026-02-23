using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// API controller for managing project item tasks
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskManagementService _taskService;
    private readonly ILogger<TasksController> _logger;

    public TasksController(
        ITaskManagementService taskService,
        ILogger<TasksController> logger)
    {
        _taskService = taskService;
        _logger = logger;
    }

    // -- Task CRUD -------------------------------------------------------------
    
    /// <summary>
    /// Create a new task
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProjectItemTask>> CreateTask([FromBody] CreateTaskRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var companyId = GetCurrentCompanyId();

            var task = await _taskService.CreateTaskAsync(
                companyId,
                request.ProjectId,
                request.ProjectItemId,
                request.Title,
                request.Description,
                request.AssignedToUserId,
                userId,
                request.Priority,
                request.DueDate,
                request.ScheduledStartDate,
                request.ScheduledEndDate,
                request.EstimatedHours,
                request.RequiresPreStartConfirmation,
                request.PreStartConfirmationHours
            );

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create task");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get task by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectItemTask>> GetTask(int id)
    {
        var task = await _taskService.GetTaskByIdAsync(id);
        if (task == null)
            return NotFound();

        return Ok(task);
    }

    /// <summary>
    /// Get tasks by project ID
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<ProjectItemTask>>> GetTasksByProject(int projectId)
    {
        var tasks = await _taskService.GetTasksByProjectIdAsync(projectId);
        return Ok(tasks);
    }

    /// <summary>
    /// Get tasks by project item ID
    /// </summary>
    [HttpGet("project-item/{projectItemId}")]
    public async Task<ActionResult<IEnumerable<ProjectItemTask>>> GetTasksByProjectItem(int projectItemId)
    {
        var tasks = await _taskService.GetTasksByProjectItemIdAsync(projectItemId);
        return Ok(tasks);
    }

    /// <summary>
    /// Get tasks assigned to current user
    /// </summary>
    [HttpGet("my-tasks")]
    public async Task<ActionResult<IEnumerable<ProjectItemTask>>> GetMyTasks()
    {
        var userId = GetCurrentUserId();
        var tasks = await _taskService.GetTasksByAssignedUserAsync(userId);
        return Ok(tasks);
    }

    /// <summary>
    /// Get overdue tasks
    /// </summary>
    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<ProjectItemTask>>> GetOverdueTasks()
    {
        var companyId = GetCurrentCompanyId();
        var tasks = await _taskService.GetOverdueTasksAsync(companyId);
        return Ok(tasks);
    }

    /// <summary>
    /// Get tasks due soon
    /// </summary>
    [HttpGet("due-soon")]
    public async Task<ActionResult<IEnumerable<ProjectItemTask>>> GetTasksDueSoon([FromQuery] int days = 3)
    {
        var companyId = GetCurrentCompanyId();
        var tasks = await _taskService.GetTasksDueSoonAsync(companyId, days);
        return Ok(tasks);
    }

    /// <summary>
    /// Update task
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ProjectItemTask>> UpdateTask(int id, [FromBody] UpdateTaskRequest request)
    {
        try
        {
            var task = await _taskService.UpdateTaskAsync(
                id,
                request.Title,
                request.Description,
                request.AssignedToUserId,
                request.Priority,
                request.DueDate,
                request.ScheduledStartDate,
                request.ScheduledEndDate,
                request.EstimatedHours,
                request.ActualHours,
                request.ProgressPercentage,
                request.InternalNotes
            );
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete task
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTask(int id)
    {
        try
        {
            await _taskService.DeleteTaskAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    // -- Task Workflow ---------------------------------------------------------

    /// <summary>
    /// Start a task
    /// </summary>
    [HttpPost("{id}/start")]
    public async Task<ActionResult<ProjectItemTask>> StartTask(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.StartTaskAsync(id, userId);
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to start task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Submit task for review
    /// </summary>
    [HttpPost("{id}/submit-review")]
    public async Task<ActionResult<ProjectItemTask>> SubmitForReview(int id, [FromBody] SubmitReviewRequest request)
    {
        try
        {
            var task = await _taskService.SubmitForReviewAsync(id, request?.Notes);
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to submit task {TaskId} for review", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Approve task
    /// </summary>
    [HttpPost("{id}/approve")]
    public async Task<ActionResult<ProjectItemTask>> ApproveTask(int id, [FromBody] ReviewRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.ApproveTaskAsync(id, userId, request?.Comments, request?.QualityRating);
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to approve task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reject task
    /// </summary>
    [HttpPost("{id}/reject")]
    public async Task<ActionResult<ProjectItemTask>> RejectTask(int id, [FromBody] RejectRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.RejectTaskAsync(id, userId, request?.RejectionReason);
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reject task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Request revision for task
    /// </summary>
    [HttpPost("{id}/request-revision")]
    public async Task<ActionResult<ProjectItemTask>> RequestRevision(int id, [FromBody] RevisionRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.RequestRevisionAsync(id, userId, request.RevisionInstructions);
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to request revision for task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Put task on hold
    /// </summary>
    [HttpPost("{id}/hold")]
    public async Task<ActionResult<ProjectItemTask>> PutTaskOnHold(int id, [FromBody] HoldRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.PutTaskOnHoldAsync(id, userId, request?.Reason);
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to put task {TaskId} on hold", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Resume task
    /// </summary>
    [HttpPost("{id}/resume")]
    public async Task<ActionResult<ProjectItemTask>> ResumeTask(int id, [FromBody] ResumeRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.ResumeTaskAsync(id, userId, request?.Notes);
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to resume task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cancel task
    /// </summary>
    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<ProjectItemTask>> CancelTask(int id, [FromBody] CancelRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.CancelTaskAsync(id, userId, request?.Reason);
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cancel task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    // -- Task Assignment -------------------------------------------------------

    /// <summary>
    /// Assign task to user
    /// </summary>
    [HttpPost("{id}/assign")]
    public async Task<ActionResult<ProjectItemTask>> AssignTask(int id, [FromBody] AssignRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.AssignTaskAsync(id, request.AssignedToUserId, userId);
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to assign task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    // -- Pre-Start Confirmation ------------------------------------------------

    /// <summary>
    /// Confirm pre-start for task
    /// </summary>
    [HttpPost("{id}/confirm-pre-start")]
    public async Task<ActionResult<ProjectItemTask>> ConfirmPreStart(int id, [FromBody] PreStartConfirmRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.ConfirmPreStartAsync(id, userId, request?.Notes);
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to confirm pre-start for task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Authorize forced start for task
    /// </summary>
    [HttpPost("{id}/authorize-forced-start")]
    public async Task<ActionResult<ProjectItemTask>> AuthorizeForcedStart(int id, [FromBody] ForcedStartRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.AuthorizeForcedStartAsync(id, userId, request.Reason);
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to authorize forced start for task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    // -- Task Attachments ------------------------------------------------------

    /// <summary>
    /// Add attachment to task
    /// </summary>
    [HttpPost("{id}/attachments")]
    public async Task<ActionResult<ProjectItemTaskAttachment>> AddAttachment(int id, [FromBody] AddAttachmentRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var attachment = await _taskService.AddAttachmentAsync(
                id,
                request.FileName,
                request.FilePath,
                request.FileSize,
                request.ContentType,
                request.MediaType,
                userId,
                request.Caption,
                request.Description,
                request.Latitude,
                request.Longitude,
                request.IsBeforePhoto,
                request.IsAfterPhoto
            );
            return Ok(attachment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to add attachment to task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get attachments for task
    /// </summary>
    [HttpGet("{id}/attachments")]
    public async Task<ActionResult<IEnumerable<ProjectItemTaskAttachment>>> GetAttachments(int id)
    {
        var attachments = await _taskService.GetTaskAttachmentsAsync(id);
        return Ok(attachments);
    }

    /// <summary>
    /// Delete attachment
    /// </summary>
    [HttpDelete("attachments/{attachmentId}")]
    public async Task<ActionResult> DeleteAttachment(int attachmentId)
    {
        try
        {
            await _taskService.DeleteAttachmentAsync(attachmentId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete attachment {AttachmentId}", attachmentId);
            return BadRequest(new { message = ex.Message });
        }
    }

    // -- Task History ----------------------------------------------------------

    /// <summary>
    /// Get task history
    /// </summary>
    [HttpGet("{id}/history")]
    public async Task<ActionResult<IEnumerable<ProjectItemTaskHistory>>> GetTaskHistory(int id)
    {
        var history = await _taskService.GetTaskHistoryAsync(id);
        return Ok(history);
    }

    // -- Task Statistics -------------------------------------------------------

    /// <summary>
    /// Get task status counts for project
    /// </summary>
    [HttpGet("stats/project/{projectId}/status-counts")]
    public async Task<ActionResult<Dictionary<TaskStatus, int>>> GetTaskStatusCounts(int projectId)
    {
        var counts = await _taskService.GetTaskStatusCountsAsync(projectId);
        return Ok(counts);
    }

    // -- Search ----------------------------------------------------------------

    /// <summary>
    /// Search tasks
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ProjectItemTask>>> SearchTasks([FromQuery] TaskSearchRequest request)
    {
        var companyId = GetCurrentCompanyId();
        var tasks = await _taskService.SearchTasksAsync(
            companyId,
            request.SearchTerm ?? "",
            request.ProjectId,
            request.ProjectItemId,
            request.Status,
            request.Priority,
            request.AssignedToUserId,
            request.DueDateFrom,
            request.DueDateTo
        );
        return Ok(tasks);
    }

    // -- Bulk Operations -------------------------------------------------------

    /// <summary>
    /// Bulk assign tasks
    /// </summary>
    [HttpPost("bulk/assign")]
    public async Task<ActionResult<IEnumerable<ProjectItemTask>>> BulkAssign([FromBody] BulkAssignRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.BulkAssignAsync(request.TaskIds, request.AssignedToUserId, userId);
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to bulk assign tasks");
            return BadRequest(new { message = ex.Message });
        }
    }

    // -- Helper Methods --------------------------------------------------------

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    private int GetCurrentCompanyId()
    {
        var companyIdClaim = User.FindFirst("companyId")?.Value;
        return int.TryParse(companyIdClaim, out var companyId) ? companyId : 0;
    }
}

// -- Request DTOs -----------------------------------------------------------

public record CreateTaskRequest
{
    public int ProjectId { get; init; }
    public int ProjectItemId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int? AssignedToUserId { get; init; }
    public TaskPriority Priority { get; init; } = TaskPriority.Normal;
    public DateTime? DueDate { get; init; }
    public DateTime? ScheduledStartDate { get; init; }
    public DateTime? ScheduledEndDate { get; init; }
    public decimal? EstimatedHours { get; init; }
    public bool RequiresPreStartConfirmation { get; init; } = false;
    public int PreStartConfirmationHours { get; init; } = 24;
}

public record UpdateTaskRequest
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public int? AssignedToUserId { get; init; }
    public TaskPriority? Priority { get; init; }
    public DateTime? DueDate { get; init; }
    public DateTime? ScheduledStartDate { get; init; }
    public DateTime? ScheduledEndDate { get; init; }
    public decimal? EstimatedHours { get; init; }
    public decimal? ActualHours { get; init; }
    public decimal? ProgressPercentage { get; init; }
    public string? InternalNotes { get; init; }
}

public record SubmitReviewRequest
{
    public string? Notes { get; init; }
}

public record ReviewRequest
{
    public string? Comments { get; init; }
    public int? QualityRating { get; init; }
}

public record RejectRequest
{
    public string? RejectionReason { get; init; }
}

public record RevisionRequest
{
    public string RevisionInstructions { get; init; } = string.Empty;
}

public record HoldRequest
{
    public string? Reason { get; init; }
}

public record ResumeRequest
{
    public string? Notes { get; init; }
}

public record CancelRequest
{
    public string? Reason { get; init; }
}

public record AssignRequest
{
    public int AssignedToUserId { get; init; }
}

public record PreStartConfirmRequest
{
    public string? Notes { get; init; }
}

public record ForcedStartRequest
{
    public string Reason { get; init; } = string.Empty;
}

public record AddAttachmentRequest
{
    public string FileName { get; init; } = string.Empty;
    public string FilePath { get; init; } = string.Empty;
    public long FileSize { get; init; }
    public string ContentType { get; init; } = string.Empty;
    public MediaType MediaType { get; init; } = MediaType.Photo;
    public string? Caption { get; init; }
    public string? Description { get; init; }
    public decimal? Latitude { get; init; }
    public decimal? Longitude { get; init; }
    public bool IsBeforePhoto { get; init; }
    public bool IsAfterPhoto { get; init; }
}

public record TaskSearchRequest
{
    public string? SearchTerm { get; init; }
    public int? ProjectId { get; init; }
    public int? ProjectItemId { get; init; }
    public ProjectTaskStatus? Status { get; init; }
    public TaskPriority? Priority { get; init; }
    public int? AssignedToUserId { get; init; }
    public DateTime? DueDateFrom { get; init; }
    public DateTime? DueDateTo { get; init; }
}

public record BulkAssignRequest
{
    public IEnumerable<int> TaskIds { get; init; } = new List<int>();
    public int AssignedToUserId { get; init; }
}
