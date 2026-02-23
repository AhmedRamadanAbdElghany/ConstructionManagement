using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// API controller for managing escalations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EscalationsController : ControllerBase
{
    private readonly IEscalationService _escalationService;
    private readonly ILogger<EscalationsController> _logger;

    public EscalationsController(
        IEscalationService escalationService,
        ILogger<EscalationsController> logger)
    {
        _escalationService = escalationService;
        _logger = logger;
    }

    // -- Escalation CRUD -------------------------------------------------------

    /// <summary>
    /// Create a new escalation
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProjectItemEscalation>> CreateEscalation([FromBody] CreateEscalationRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var companyId = GetCurrentCompanyId();

            var escalation = await _escalationService.CreateEscalationAsync(
                companyId,
                request.ProjectId,
                request.EscalationType,
                request.Severity,
                request.Title,
                request.Description,
                request.ProjectItemId,
                request.TaskId,
                userId,
                request.TriggerReason,
                request.EstimatedCostImpact,
                request.EstimatedDelayDays,
                request.AffectsCriticalPath
            );

            return CreatedAtAction(nameof(GetEscalation), new { id = escalation.Id }, escalation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create escalation");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get escalation by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectItemEscalation>> GetEscalation(int id)
    {
        var escalation = await _escalationService.GetEscalationByIdAsync(id);
        if (escalation == null)
            return NotFound();

        return Ok(escalation);
    }

    /// <summary>
    /// Get escalations by project ID
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<ProjectItemEscalation>>> GetEscalationsByProject(int projectId)
    {
        var escalations = await _escalationService.GetEscalationsByProjectIdAsync(projectId);
        return Ok(escalations);
    }

    /// <summary>
    /// Get open escalations for current company
    /// </summary>
    [HttpGet("open")]
    public async Task<ActionResult<IEnumerable<ProjectItemEscalation>>> GetOpenEscalations()
    {
        var companyId = GetCurrentCompanyId();
        var escalations = await _escalationService.GetOpenEscalationsAsync(companyId);
        return Ok(escalations);
    }

    /// <summary>
    /// Get escalations assigned to current user
    /// </summary>
    [HttpGet("my-escalations")]
    public async Task<ActionResult<IEnumerable<ProjectItemEscalation>>> GetMyEscalations()
    {
        var userId = GetCurrentUserId();
        var escalations = await _escalationService.GetEscalationsAssignedToUserAsync(userId);
        return Ok(escalations);
    }

    /// <summary>
    /// Get escalations by status
    /// </summary>
    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<ProjectItemEscalation>>> GetEscalationsByStatus(EscalationStatus status)
    {
        var companyId = GetCurrentCompanyId();
        var escalations = await _escalationService.GetEscalationsByStatusAsync(companyId, status);
        return Ok(escalations);
    }

    // -- Escalation Workflow ---------------------------------------------------

    /// <summary>
    /// Acknowledge escalation
    /// </summary>
    [HttpPost("{id}/acknowledge")]
    public async Task<ActionResult<ProjectItemEscalation>> AcknowledgeEscalation(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var escalation = await _escalationService.AcknowledgeEscalationAsync(id, userId);
            return Ok(escalation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to acknowledge escalation {EscalationId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Assign escalation to user
    /// </summary>
    [HttpPost("{id}/assign")]
    public async Task<ActionResult<ProjectItemEscalation>> AssignEscalation(int id, [FromBody] AssignEscalationRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var escalation = await _escalationService.AssignEscalationAsync(id, request.AssignedToUserId, userId);
            return Ok(escalation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to assign escalation {EscalationId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Resolve escalation
    /// </summary>
    [HttpPost("{id}/resolve")]
    public async Task<ActionResult<ProjectItemEscalation>> ResolveEscalation(int id, [FromBody] ResolveEscalationRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var escalation = await _escalationService.ResolveEscalationAsync(id, userId, request.ResolutionNotes, request.ResolutionAction);
            return Ok(escalation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to resolve escalation {EscalationId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Close escalation
    /// </summary>
    [HttpPost("{id}/close")]
    public async Task<ActionResult<ProjectItemEscalation>> CloseEscalation(int id, [FromBody] CloseEscalationRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var escalation = await _escalationService.CloseEscalationAsync(id, userId, request?.Notes);
            return Ok(escalation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to close escalation {EscalationId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Escalate to next level
    /// </summary>
    [HttpPost("{id}/escalate")]
    public async Task<ActionResult<ProjectItemEscalation>> EscalateToNextLevel(int id, [FromBody] EscalateRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var escalation = await _escalationService.EscalateToNextLevelAsync(id, userId, request.Reason);
            return Ok(escalation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to escalate {EscalationId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reopen escalation
    /// </summary>
    [HttpPost("{id}/reopen")]
    public async Task<ActionResult<ProjectItemEscalation>> ReopenEscalation(int id, [FromBody] ReopenRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var escalation = await _escalationService.ReopenEscalationAsync(id, userId, request.Reason);
            return Ok(escalation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reopen escalation {EscalationId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    // -- Escalation Actions ----------------------------------------------------

    /// <summary>
    /// Add action to escalation
    /// </summary>
    [HttpPost("{id}/actions")]
    public async Task<ActionResult<EscalationAction>> AddAction(int id, [FromBody] AddActionRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var action = await _escalationService.AddActionAsync(id, request.ActionType, userId, request.Description, request.IsResolution);
            return Ok(action);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to add action to escalation {EscalationId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get escalation actions
    /// </summary>
    [HttpGet("{id}/actions")]
    public async Task<ActionResult<IEnumerable<EscalationAction>>> GetEscalationActions(int id)
    {
        var actions = await _escalationService.GetEscalationActionsAsync(id);
        return Ok(actions);
    }

    // -- Follow-up -------------------------------------------------------------

    /// <summary>
    /// Schedule follow-up
    /// </summary>
    [HttpPost("{id}/schedule-follow-up")]
    public async Task<ActionResult<ProjectItemEscalation>> ScheduleFollowUp(int id, [FromBody] ScheduleFollowUpRequest request)
    {
        try
        {
            var escalation = await _escalationService.ScheduleFollowUpAsync(id, request.FollowUpDate, request?.Notes);
            return Ok(escalation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to schedule follow-up for escalation {EscalationId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get pending follow-ups
    /// </summary>
    [HttpGet("pending-follow-ups")]
    public async Task<ActionResult<IEnumerable<ProjectItemEscalation>>> GetPendingFollowUps()
    {
        var companyId = GetCurrentCompanyId();
        var escalations = await _escalationService.GetPendingFollowUpsAsync(companyId);
        return Ok(escalations);
    }

    // -- Statistics ------------------------------------------------------------

    /// <summary>
    /// Get escalation type counts
    /// </summary>
    [HttpGet("stats/type-counts")]
    public async Task<ActionResult<Dictionary<EscalationType, int>>> GetTypeCounts([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
    {
        var companyId = GetCurrentCompanyId();
        var counts = await _escalationService.GetEscalationTypeCountsAsync(companyId, fromDate, toDate);
        return Ok(counts);
    }

    /// <summary>
    /// Get escalation status counts
    /// </summary>
    [HttpGet("stats/status-counts")]
    public async Task<ActionResult<Dictionary<EscalationStatus, int>>> GetStatusCounts()
    {
        var companyId = GetCurrentCompanyId();
        var counts = await _escalationService.GetEscalationStatusCountsAsync(companyId);
        return Ok(counts);
    }

    /// <summary>
    /// Get escalation severity counts
    /// </summary>
    [HttpGet("stats/severity-counts")]
    public async Task<ActionResult<Dictionary<EscalationSeverity, int>>> GetSeverityCounts()
    {
        var companyId = GetCurrentCompanyId();
        var counts = await _escalationService.GetEscalationSeverityCountsAsync(companyId);
        return Ok(counts);
    }

    /// <summary>
    /// Get average resolution time
    /// </summary>
    [HttpGet("stats/average-resolution-time")]
    public async Task<ActionResult<decimal>> GetAverageResolutionTime([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
    {
        var companyId = GetCurrentCompanyId();
        var hours = await _escalationService.GetAverageResolutionTimeAsync(companyId, fromDate, toDate);
        return Ok(hours);
    }

    // -- Search ----------------------------------------------------------------

    /// <summary>
    /// Search escalations
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ProjectItemEscalation>>> SearchEscalations([FromQuery] EscalationSearchRequest request)
    {
        var companyId = GetCurrentCompanyId();
        var escalations = await _escalationService.SearchEscalationsAsync(
            companyId,
            request.SearchTerm ?? "",
            request.ProjectId,
            request.Type,
            request.Status,
            request.Severity,
            request.AssignedToUserId,
            request.CreatedFrom,
            request.CreatedTo
        );
        return Ok(escalations);
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

public record CreateEscalationRequest
{
    public int ProjectId { get; init; }
    public EscalationType EscalationType { get; init; }
    public EscalationSeverity Severity { get; init; } = EscalationSeverity.Medium;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int? ProjectItemId { get; init; }
    public int? TaskId { get; init; }
    public string? TriggerReason { get; init; }
    public decimal? EstimatedCostImpact { get; init; }
    public int? EstimatedDelayDays { get; init; }
    public bool AffectsCriticalPath { get; init; } = false;
}

public record AssignEscalationRequest
{
    public int AssignedToUserId { get; init; }
}

public record ResolveEscalationRequest
{
    public string ResolutionNotes { get; init; } = string.Empty;
    public string? ResolutionAction { get; init; }
}

public record CloseEscalationRequest
{
    public string? Notes { get; init; }
}

public record EscalateRequest
{
    public string Reason { get; init; } = string.Empty;
}

public record ReopenRequest
{
    public string Reason { get; init; } = string.Empty;
}

public record AddActionRequest
{
    public EscalationActionType ActionType { get; init; }
    public string Description { get; init; } = string.Empty;
    public bool IsResolution { get; init; } = false;
}

public record ScheduleFollowUpRequest
{
    public DateTime FollowUpDate { get; init; }
    public string? Notes { get; init; }
}

public record EscalationSearchRequest
{
    public string? SearchTerm { get; init; }
    public int? ProjectId { get; init; }
    public EscalationType? Type { get; init; }
    public EscalationStatus? Status { get; init; }
    public EscalationSeverity? Severity { get; init; }
    public int? AssignedToUserId { get; init; }
    public DateTime? CreatedFrom { get; init; }
    public DateTime? CreatedTo { get; init; }
}
