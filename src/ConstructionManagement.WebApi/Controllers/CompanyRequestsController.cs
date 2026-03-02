using ConstructionManagement.Application.DTOs.CompanyRequest;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompanyRequestsController : ControllerBase
{
    private readonly ICompanyRequestService _companyRequestService;
    private readonly IAuthService _authService;

    public CompanyRequestsController(
        ICompanyRequestService companyRequestService,
        IAuthService authService)
    {
        _companyRequestService = companyRequestService;
        _authService = authService;
    }

    /// <summary>
    /// Create a new company creation request (Company Owners only)
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateRequest([FromBody] CreateCompanyRequestDto dto)
    {
        var userId = _authService.GetCurrentUserId();
        var request = await _companyRequestService.CreateRequestAsync(userId, dto);
        return Ok(request);
    }

    /// <summary>
    /// Get all company requests (System Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetAllRequests()
    {
        var requests = await _companyRequestService.GetAllRequestsAsync();
        return Ok(requests);
    }

    /// <summary>
    /// Get pending company requests (System Admin only)
    /// </summary>
    [HttpGet("pending")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var requests = await _companyRequestService.GetPendingRequestsAsync();
        return Ok(requests);
    }

    /// <summary>
    /// Get my company request
    /// </summary>
    [HttpGet("my-request")]
    [Authorize]
    public async Task<IActionResult> GetMyRequest()
    {
        var userId = _authService.GetCurrentUserId();
        var request = await _companyRequestService.GetMyRequestAsync(userId);
        return Ok(request);
    }

    /// <summary>
    /// Get a single company request by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var request = await _companyRequestService.GetByIdAsync(id);
        if (request == null)
            return NotFound();
        return Ok(request);
    }

    /// <summary>
    /// Approve a company request (System Admin only)
    /// </summary>
    [HttpPost("{id}/approve")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> ApproveRequest(int id, [FromBody] ApproveCompanyRequestDto? dto = null)
    {
        var reviewedByUserId = _authService.GetCurrentUserId();
        var request = await _companyRequestService.ApproveRequestAsync(id, reviewedByUserId, dto);
        return Ok(request);
    }

    /// <summary>
    /// Reject a company request (System Admin only)
    /// </summary>
    [HttpPost("{id}/reject")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> RejectRequest(int id, [FromBody] RejectCompanyRequestDto dto)
    {
        dto.ReviewedByUserId = _authService.GetCurrentUserId();
        var request = await _companyRequestService.RejectRequestAsync(id, dto);
        return Ok(request);
    }

    /// <summary>
    /// Delete a company request
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteRequest(int id)
    {
        var result = await _companyRequestService.DeleteRequestAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Get pending requests count (System Admin only)
    /// </summary>
    [HttpGet("count")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetPendingCount()
    {
        var count = await _companyRequestService.GetPendingCountAsync();
        return Ok(new { pendingCount = count });
    }
}

