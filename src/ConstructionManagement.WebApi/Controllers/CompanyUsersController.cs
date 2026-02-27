using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// Controller for managing company-user relationships
/// </summary>
[Route("api/company-users")]
[ApiController]
[Authorize]
public class CompanyUsersController : ControllerBase
{
    private readonly ICompanyUserService _companyUserService;
    private readonly ICurrentUserService _currentUserService;

    public CompanyUsersController(
        ICompanyUserService companyUserService,
        ICurrentUserService currentUserService)
    {
        _companyUserService = companyUserService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Update the status of a company-user relationship
    /// </summary>
    [HttpPut("{companyUserId}/status")]
    public async Task<IActionResult> UpdateStatus(int companyUserId, [FromBody] UpdateCompanyUserStatusRequest request)
    {
        var currentUserId = _currentUserService.UserId;
        var success = await _companyUserService.UpdateStatusAsync(companyUserId, request.Status, currentUserId);
        
        if (!success)
            return BadRequest(new { message = "Failed to update status. You may not have permission or the relationship does not exist." });
        
        return Ok(new { message = "Status updated successfully" });
    }

    /// <summary>
    /// Get all company-user relationships for the current user (including Draft)
    /// </summary>
    [HttpGet("me/companies")]
    public async Task<IActionResult> GetMyCompanies()
    {
        var currentUserId = _currentUserService.UserId;
        var companies = await _companyUserService.GetAllByUserIdAsync(currentUserId);
        return Ok(companies);
    }

    /// <summary>
    /// Get all company-user relationships for a specific user (including Draft)
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserCompanies(int userId)
    {
        var companies = await _companyUserService.GetAllByUserIdAsync(userId);
        return Ok(companies);
    }

    /// <summary>
    /// Get all users for a company (including Draft)
    /// </summary>
    [HttpGet("company/{companyId}/users")]
    [Authorize(Policy = "RequireCompanyAdmin")]
    public async Task<IActionResult> GetCompanyUsers(int companyId)
    {
        var users = await _companyUserService.GetAllByCompanyIdAsync(companyId);
        return Ok(users);
    }

    /// <summary>
    /// Get draft company-user relationships for the current user
    /// </summary>
    [HttpGet("me/draft")]
    public async Task<IActionResult> GetMyDraftCompanies()
    {
        var currentUserId = _currentUserService.UserId;
        var companies = await _companyUserService.GetDraftByUserIdAsync(currentUserId);
        return Ok(companies);
    }

    /// <summary>
    /// Get draft users for a company
    /// </summary>
    [HttpGet("company/{companyId}/draft-users")]
    [Authorize(Policy = "RequireCompanyAdmin")]
    public async Task<IActionResult> GetCompanyDraftUsers(int companyId)
    {
        var users = await _companyUserService.GetDraftByCompanyIdAsync(companyId);
        return Ok(users);
    }

    /// <summary>
    /// Get a specific company-user relationship by ID
    /// </summary>
    [HttpGet("{companyUserId}")]
    public async Task<IActionResult> GetById(int companyUserId)
    {
        var relationship = await _companyUserService.GetByIdAsync(companyUserId);
        if (relationship == null)
            return NotFound(new { message = "Company-user relationship not found" });
        
        return Ok(relationship);
    }
}
