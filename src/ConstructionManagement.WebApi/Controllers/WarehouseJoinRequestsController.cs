using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WarehouseJoinRequestsController : ControllerBase
{
    private readonly IWarehouseJoinRequestService _joinRequestService;
    private readonly ICompanyContext _companyContext;

    public WarehouseJoinRequestsController(
        IWarehouseJoinRequestService joinRequestService,
        ICompanyContext companyContext)
    {
        _joinRequestService = joinRequestService;
        _companyContext = companyContext;
    }

    /// <summary>
    /// Get all join requests for the current warehouse (InventoryOwner only)
    /// </summary>
    [HttpGet("warehouse")]
    [Authorize(Roles = "InventoryOwner,CompanyAdmin")]
    public async Task<ActionResult<IEnumerable<WarehouseJoinRequestDto>>> GetWarehouseJoinRequests([FromQuery] string? status = null)
    {
        var companyId = _companyContext.CompanyId;
        if (companyId == null)
        {
            return BadRequest(new { message = "No company context found" });
        }

        var userId = GetCurrentUserId();
        var requests = status?.ToLower() == "pending" 
            ? await _joinRequestService.GetPendingRequestsAsync(companyId.Value, userId)
            : await _joinRequestService.GetAllRequestsAsync(companyId.Value, userId);
        return Ok(requests);
    }

    /// <summary>
    /// Get join requests submitted by the current user
    /// </summary>
    [HttpGet("my-requests")]
    public async Task<ActionResult<IEnumerable<WarehouseJoinRequestDto>>> GetMyJoinRequests()
    {
        var userId = GetCurrentUserId();
        var requests = await _joinRequestService.GetMyRequestsAsync(userId);
        return Ok(requests);
    }

    /// <summary>
    /// Get a specific join request by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<WarehouseJoinRequestDto>> GetJoinRequest(int id)
    {
        var request = await _joinRequestService.GetByIdAsync(id);
        if (request == null)
        {
            return NotFound(new { message = "Join request not found" });
        }

        // Authorization: Only the user who created the request or warehouse owner can view
        var userId = GetCurrentUserId();
        var companyId = _companyContext.CompanyId;
        
        if (request.UserId != userId && request.CompanyId != companyId)
        {
            // Check if user is SystemAdmin
            var userRoles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();
            if (!userRoles.Contains("SystemAdmin"))
            {
                return Forbid();
            }
        }

        return Ok(request);
    }

    /// <summary>
    /// Submit a new join request to a warehouse
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<WarehouseJoinRequestDto>> SubmitJoinRequest([FromBody] CreateWarehouseJoinRequestDto dto)
    {
        var userId = GetCurrentUserId();
        
        try
        {
            var request = await _joinRequestService.CreateRequestAsync(userId, dto);
            return CreatedAtAction(nameof(GetJoinRequest), new { id = request.Id }, request);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Approve a join request (InventoryOwner only)
    /// </summary>
    [HttpPost("{id}/approve")]
    [Authorize(Roles = "InventoryOwner,CompanyAdmin")]
    public async Task<ActionResult<WarehouseJoinRequestDto>> ApproveJoinRequest(int id, [FromBody] ApproveJoinRequestDto? dto = null)
    {
        var companyId = _companyContext.CompanyId;
        if (companyId == null)
        {
            return BadRequest(new { message = "No company context found" });
        }

        var reviewerId = GetCurrentUserId();

        try
        {
            var reviewDto = new ReviewWarehouseJoinRequestDto
            {
                Approve = true,
                RoleId = dto?.RoleId
            };
            var request = await _joinRequestService.ReviewRequestAsync(id, reviewerId, reviewDto);
            return Ok(request);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Reject a join request (InventoryOwner only)
    /// </summary>
    [HttpPost("{id}/reject")]
    [Authorize(Roles = "InventoryOwner,CompanyAdmin")]
    public async Task<ActionResult<WarehouseJoinRequestDto>> RejectJoinRequest(int id, [FromBody] RejectWarehouseJoinRequestDto dto)
    {
        var companyId = _companyContext.CompanyId;
        if (companyId == null)
        {
            return BadRequest(new { message = "No company context found" });
        }

        var reviewerId = GetCurrentUserId();

        try
        {
            var reviewDto = new ReviewWarehouseJoinRequestDto
            {
                Approve = false,
                RejectionReason = dto.RejectionReason
            };
            var request = await _joinRequestService.ReviewRequestAsync(id, reviewerId, reviewDto);
            return Ok(request);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Cancel a pending join request (User only)
    /// </summary>
    [HttpPost("{id}/cancel")]
    public async Task<ActionResult> CancelJoinRequest(int id)
    {
        var userId = GetCurrentUserId();

        try
        {
            await _joinRequestService.CancelRequestAsync(id, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Get pending join requests count for the current warehouse
    /// </summary>
    [HttpGet("warehouse/pending-count")]
    [Authorize(Roles = "InventoryOwner,CompanyAdmin")]
    public async Task<ActionResult<int>> GetPendingCount()
    {
        var companyId = _companyContext.CompanyId;
        if (companyId == null)
        {
            return BadRequest(new { message = "No company context found" });
        }

        var userId = GetCurrentUserId();
        var requests = await _joinRequestService.GetPendingRequestsAsync(companyId.Value, userId);
        return Ok(new { count = requests.Count() });
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user token");
        }
        return userId;
    }
}

public class ApproveJoinRequestDto
{
    public int? RoleId { get; set; }
}

public class RejectWarehouseJoinRequestDto
{
    public string? RejectionReason { get; set; }
}

