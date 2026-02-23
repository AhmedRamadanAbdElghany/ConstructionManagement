using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// API controller for daily task board operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DailyTaskBoardController : ControllerBase
{
    private readonly IDailyTaskBoardService _dailyBoardService;
    private readonly ILogger<DailyTaskBoardController> _logger;

    public DailyTaskBoardController(
        IDailyTaskBoardService dailyBoardService,
        ILogger<DailyTaskBoardController> logger)
    {
        _dailyBoardService = dailyBoardService;
        _logger = logger;
    }

    // -- Board Retrieval --------------------------------------------------------

    /// <summary>
    /// Get daily board for current company
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DailyTaskBoard>>> GetDailyBoard([FromQuery] DateTime? date)
    {
        var companyId = GetCurrentCompanyId();
        var board = await _dailyBoardService.GetDailyBoardAsync(companyId, date);
        return Ok(board);
    }

    /// <summary>
    /// Get daily board for project
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<DailyTaskBoard>>> GetProjectDailyBoard(int projectId, [FromQuery] DateTime? date)
    {
        var board = await _dailyBoardService.GetProjectDailyBoardAsync(projectId, date);
        return Ok(board);
    }

    /// <summary>
    /// Get daily board for current user
    /// </summary>
    [HttpGet("my-board")]
    public async Task<ActionResult<IEnumerable<DailyTaskBoard>>> GetMyDailyBoard([FromQuery] DateTime? date)
    {
        var userId = GetCurrentUserId();
        var board = await _dailyBoardService.GetUserDailyBoardAsync(userId, date);
        return Ok(board);
    }

    /// <summary>
    /// Get board entry by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<DailyTaskBoard>> GetBoardEntry(int id)
    {
        var entry = await _dailyBoardService.GetBoardEntryByIdAsync(id);
        if (entry == null)
            return NotFound();

        return Ok(entry);
    }

    // -- Board Entry Management -------------------------------------------------

    /// <summary>
    /// Update board entry status
    /// </summary>
    [HttpPut("{id}/status")]
    public async Task<ActionResult<DailyTaskBoard>> UpdateStatus(int id, [FromBody] UpdateBoardStatusRequest request)
    {
        try
        {
            var entry = await _dailyBoardService.UpdateBoardEntryStatusAsync(id, request.Status, request?.Notes);
            return Ok(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update board entry status {EntryId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update board entry progress
    /// </summary>
    [HttpPut("{id}/progress")]
    public async Task<ActionResult<DailyTaskBoard>> UpdateProgress(int id, [FromBody] UpdateProgressRequest request)
    {
        try
        {
            var entry = await _dailyBoardService.UpdateBoardEntryProgressAsync(id, request.ProgressPercentage);
            return Ok(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update board entry progress {EntryId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Set actual start time
    /// </summary>
    [HttpPost("{id}/start")]
    public async Task<ActionResult<DailyTaskBoard>> SetActualStart(int id, [FromBody] SetActualStartRequest request)
    {
        try
        {
            var entry = await _dailyBoardService.SetActualStartAsync(id, request.ActualStart ?? DateTime.UtcNow);
            return Ok(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to set actual start for board entry {EntryId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Set actual end time
    /// </summary>
    [HttpPost("{id}/complete")]
    public async Task<ActionResult<DailyTaskBoard>> SetActualEnd(int id, [FromBody] SetActualEndRequest request)
    {
        try
        {
            var entry = await _dailyBoardService.SetActualEndAsync(id, request.ActualEnd ?? DateTime.UtcNow);
            return Ok(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to set actual end for board entry {EntryId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    // -- Pre-Start Confirmation -------------------------------------------------

    /// <summary>
    /// Confirm pre-start for board entry
    /// </summary>
    [HttpPost("{id}/confirm-pre-start")]
    public async Task<ActionResult<DailyTaskBoard>> ConfirmPreStart(int id, [FromBody] BoardPreStartConfirmRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var entry = await _dailyBoardService.ConfirmPreStartAsync(id, userId, request?.Notes);
            return Ok(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to confirm pre-start for board entry {EntryId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Authorize forced start for board entry
    /// </summary>
    [HttpPost("{id}/authorize-forced-start")]
    public async Task<ActionResult<DailyTaskBoard>> AuthorizeForcedStart(int id, [FromBody] BoardForcedStartRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var entry = await _dailyBoardService.AuthorizeForcedStartAsync(id, userId, request.Reason);
            return Ok(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to authorize forced start for board entry {EntryId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    // -- Statistics -------------------------------------------------------------

    /// <summary>
    /// Get board status counts
    /// </summary>
    [HttpGet("stats/status-counts")]
    public async Task<ActionResult<Dictionary<DailyBoardEntryStatus, int>>> GetStatusCounts([FromQuery] DateTime? date)
    {
        var companyId = GetCurrentCompanyId();
        var counts = await _dailyBoardService.GetBoardStatusCountsAsync(companyId, date);
        return Ok(counts);
    }

    /// <summary>
    /// Get items starting today count
    /// </summary>
    [HttpGet("stats/starting-today")]
    public async Task<ActionResult<int>> GetItemsStartingTodayCount()
    {
        var companyId = GetCurrentCompanyId();
        var count = await _dailyBoardService.GetItemsStartingTodayCountAsync(companyId);
        return Ok(count);
    }

    /// <summary>
    /// Get items ending today count
    /// </summary>
    [HttpGet("stats/ending-today")]
    public async Task<ActionResult<int>> GetItemsEndingTodayCount()
    {
        var companyId = GetCurrentCompanyId();
        var count = await _dailyBoardService.GetItemsEndingTodayCountAsync(companyId);
        return Ok(count);
    }

    /// <summary>
    /// Get overdue items count
    /// </summary>
    [HttpGet("stats/overdue")]
    public async Task<ActionResult<int>> GetOverdueItemsCount()
    {
        var companyId = GetCurrentCompanyId();
        var count = await _dailyBoardService.GetOverdueItemsCountAsync(companyId);
        return Ok(count);
    }

    /// <summary>
    /// Get not started items count
    /// </summary>
    [HttpGet("stats/not-started")]
    public async Task<ActionResult<int>> GetNotStartedItemsCount([FromQuery] DateTime? date)
    {
        var companyId = GetCurrentCompanyId();
        var count = await _dailyBoardService.GetNotStartedItemsCountAsync(companyId, date);
        return Ok(count);
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

public record UpdateBoardStatusRequest
{
    public DailyBoardEntryStatus Status { get; init; }
    public string? Notes { get; init; }
}

public record UpdateProgressRequest
{
    public decimal ProgressPercentage { get; init; }
}

public record SetActualStartRequest
{
    public DateTime? ActualStart { get; init; }
}

public record SetActualEndRequest
{
    public DateTime? ActualEnd { get; init; }
}

public record BoardPreStartConfirmRequest
{
    public string? Notes { get; init; }
}

public record BoardForcedStartRequest
{
    public string Reason { get; init; } = string.Empty;
}
