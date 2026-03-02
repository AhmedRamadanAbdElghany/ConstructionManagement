using ConstructionManagement.Application.DTOs.JoinRequest;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace ConstructionManagement.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JoinRequestsController : ControllerBase
{
    private readonly IJoinRequestService _joinRequestService;
    private readonly IAuthService _authService;

    public JoinRequestsController(
        IJoinRequestService joinRequestService,
        IAuthService authService)
    {
        _joinRequestService = joinRequestService;
        _authService = authService;
    }

    /// <summary>
    /// Create a new join company request (Normal Users and Workers)
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateRequest([FromBody] CreateJoinRequestDto dto)
    {
        var userId = _authService.GetCurrentUserId();
        var request = await _joinRequestService.CreateRequestAsync(userId, dto);
        return Ok(request);
    }

    /// <summary>
    /// Get all join requests (Company Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<IActionResult> GetAllRequests()
    {
        var userId = _authService.GetCurrentUserId();
        var user = await _authService.GetCurrentUserAsync();
        
        // SystemAdmin can see all, CompanyAdmin sees only their company
        IEnumerable<JoinRequestDto> requests;
        var isSystemAdmin = user?.UserRoles?.Any(ur => ur.Role?.Name == "SystemAdmin") == true;
        if (isSystemAdmin)
        {
            requests = await _joinRequestService.GetAllRequestsAsync();
        }
        else
        {
            // Get company ID from user's company
            var companyId = user?.CompanyId ?? 0;
            requests = await _joinRequestService.GetPendingRequestsForCompanyAsync(companyId);
        }
        
        return Ok(requests);
    }

    /// <summary>
    /// Get my join requests
    /// </summary>
    [HttpGet("my-requests")]
    [Authorize]
    public async Task<IActionResult> GetMyRequests()
    {
        var userId = _authService.GetCurrentUserId();
        var requests = await _joinRequestService.GetMyRequestsAsync(userId);
        return Ok(requests);
    }

    /// <summary>
    /// Get a single join request by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var request = await _joinRequestService.GetByIdAsync(id);
        if (request == null)
            return NotFound();
        return Ok(request);
    }

    /// <summary>
    /// Approve a join request (Company Admin only)
    /// </summary>
    [HttpPost("{id}/approve")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<IActionResult> ApproveRequest(int id)
    {
        var reviewedByUserId = _authService.GetCurrentUserId();
        var request = await _joinRequestService.ApproveRequestAsync(id, reviewedByUserId);
        return Ok(request);
    }

    /// <summary>
    /// Reject a join request (Company Admin only)
    /// </summary>
    [HttpPost("{id}/reject")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<IActionResult> RejectRequest(int id, [FromBody] RejectJoinRequestDto dto)
    {
        dto.ReviewedByUserId = _authService.GetCurrentUserId();
        var request = await _joinRequestService.RejectRequestAsync(id, dto);
        return Ok(request);
    }

    /// <summary>
    /// Delete a join request
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteRequest(int id)
    {
        var result = await _joinRequestService.DeleteRequestAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Get pending requests count for current user's company (Company Admin only)
    /// </summary>
    [HttpGet("count")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<IActionResult> GetPendingCount()
    {
        var user = await _authService.GetCurrentUserAsync();
        var companyId = user?.CompanyId ?? 0;
        var count = await _joinRequestService.GetPendingCountForCompanyAsync(companyId);
        return Ok(new { pendingCount = count });
    }
}

