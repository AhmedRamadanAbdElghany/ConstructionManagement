using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PublicCompaniesController : ControllerBase
{
    private readonly IRepository<Company> _companyRepo;
    private readonly ApplicationDbContext _db;
    private readonly ICompanyContext _companyContext;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<PublicCompaniesController> _logger;

    public PublicCompaniesController(
        IRepository<Company> companyRepo,
        ApplicationDbContext db,
        ICompanyContext companyContext,
        IFileStorageService fileStorageService,
        ILogger<PublicCompaniesController> logger)
    {
        _companyRepo = companyRepo;
        _db = db;
        _companyContext = companyContext;
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetPublicCompanies([FromQuery] string? search = null)
    {
        var currentUserId = GetCurrentUserId();

        // Get companies with counts
        var query = _companyRepo.AsQueryable()
            .IgnoreQueryFilters()
            .Where(c => c.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(search) || 
                                     (c.Address != null && c.Address.ToLower().Contains(search)));
        }

        var companies = await query
            .Select(c => new PublicCompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                Address = c.Address,
                LogoUrl = c.LogoUrl,
                ContactEmail = c.ContactEmail,
                ContactPhone = c.ContactPhone,
                FollowerCount = _db.CompanyFollowers.Count(f => f.CompanyId == c.Id),
                PortfolioItemCount = _db.PortfolioItems.Count(p => p.CompanyId == c.Id),
                IsFollowedByCurrentUser = _db.CompanyFollowers.Any(f => f.CompanyId == c.Id && f.UserId == currentUserId),
                OwnerUserId = _db.Users.Where(u => u.CompanyId == c.Id && (u.UserType == UserType.CompanyOwner || u.UserType == UserType.InventoryOwner)).Select(u => u.Id).FirstOrDefault()
            })
            .OrderBy(c => c.Name)
            .ToListAsync();

        return Ok(companies);
    }

    /// <summary>
    /// Get detailed company information with portfolio
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCompanyDetail(int id)
    {
        var currentUserId = GetCurrentUserId();

        var company = await _companyRepo.AsQueryable()
            .IgnoreQueryFilters()
            .Where(c => c.Id == id && c.IsActive)
            .Select(c => new PublicCompanyDetailDto
            {
                Id = c.Id,
                Name = c.Name,
                Address = c.Address,
                LogoUrl = c.LogoUrl,
                ContactEmail = c.ContactEmail,
                ContactPhone = c.ContactPhone,
                BusinessId = c.BusinessId,
                FollowerCount = _db.CompanyFollowers.Count(f => f.CompanyId == c.Id),
                PortfolioItemCount = _db.PortfolioItems.Count(p => p.CompanyId == c.Id),
                IsFollowedByCurrentUser = _db.CompanyFollowers.Any(f => f.CompanyId == c.Id && f.UserId == currentUserId),
                OwnerUserId = _db.Users.Where(u => u.CompanyId == c.Id && (u.UserType == UserType.CompanyOwner || u.UserType == UserType.InventoryOwner)).Select(u => u.Id).FirstOrDefault(),
                PortfolioCategories = _db.PortfolioCategories
                    .Where(cat => cat.CompanyId == c.Id)
                    .Select(cat => new PortfolioCategorySummaryDto
                    {
                        Id = cat.Id,
                        Name = cat.Name,
                        Description = cat.Description,
                        ItemCount = _db.PortfolioItems.Count(p => p.CategoryId == cat.Id)
                    }).ToList(),
                PortfolioItems = _db.PortfolioItems
                    .Where(p => p.CompanyId == c.Id)
                    .OrderByDescending(p => p.CompletionDate)
                    .Select(p => new PortfolioItemSummaryDto
                    {
                        Id = p.Id,
                        Title = p.Name,
                        Description = p.Description,
                        ImageUrl = p.FileUrl,
                        CategoryName = p.Category != null ? p.Category.Name : null,
                        CompletedDate = p.CompletionDate
                    }).ToList()
            })
            .FirstOrDefaultAsync();

        if (company == null)
        {
            return NotFound(new { message = "Company not found." });
        }

        return Ok(company);
    }

    /// <summary>
    /// Get company portfolio items
    /// </summary>
    [HttpGet("{id}/portfolio")]
    public async Task<IActionResult> GetCompanyPortfolio(int id, [FromQuery] int? categoryId = null)
    {
        var query = _db.PortfolioItems
            .IgnoreQueryFilters()
            .Where(p => p.CompanyId == id);

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId);
        }

        var items = await query
            .OrderByDescending(p => p.CompletionDate)
            .Select(p => new PortfolioItemSummaryDto
            {
                Id = p.Id,
                Title = p.Name,
                Description = p.Description,
                ImageUrl = p.FileUrl,
                CategoryName = p.Category != null ? p.Category.Name : null,
                CompletedDate = p.CompletionDate
            })
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// Follow/subscribe to a company to receive announcements
    /// </summary>
    [HttpPost("{id}/follow")]
    public async Task<IActionResult> FollowCompany(int id)
    {
        var currentUserId = GetCurrentUserId();

        // Check if company exists
        var companyExists = await _db.Companies
            .IgnoreQueryFilters()
            .AnyAsync(c => c.Id == id && c.IsActive);

        if (!companyExists)
        {
            return NotFound(new { message = "Company not found." });
        }

        // Check if already following
        var existingFollow = await _db.CompanyFollowers
            .FirstOrDefaultAsync(f => f.CompanyId == id && f.UserId == currentUserId);

        if (existingFollow != null)
        {
            return BadRequest(new { message = "You are already following this company." });
        }

        var follow = new CompanyFollower
        {
            CompanyId = id,
            UserId = currentUserId,
            FollowedAt = DateTime.UtcNow
        };

        _db.CompanyFollowers.Add(follow);
        await _db.SaveChangesAsync();

        _logger.LogInformation("User {UserId} followed company {CompanyId}", currentUserId, id);

        return Ok(new { message = "Successfully followed company." });
    }

    /// <summary>
    /// Unfollow/unsubscribe from a company
    /// </summary>
    [HttpDelete("{id}/follow")]
    public async Task<IActionResult> UnfollowCompany(int id)
    {
        var currentUserId = GetCurrentUserId();

        var follow = await _db.CompanyFollowers
            .FirstOrDefaultAsync(f => f.CompanyId == id && f.UserId == currentUserId);

        if (follow == null)
        {
            return NotFound(new { message = "You are not following this company." });
        }

        _db.CompanyFollowers.Remove(follow);
        await _db.SaveChangesAsync();

        _logger.LogInformation("User {UserId} unfollowed company {CompanyId}", currentUserId, id);

        return Ok(new { message = "Successfully unfollowed company." });
    }

    /// <summary>
    /// Get companies that the current user follows
    /// </summary>
    [HttpGet("following")]
    public async Task<IActionResult> GetFollowingCompanies()
    {
        var currentUserId = GetCurrentUserId();

        var companies = await _db.CompanyFollowers
            .Where(f => f.UserId == currentUserId)
            .Select(f => new PublicCompanyDto
            {
                Id = f.Company.Id,
                Name = f.Company.Name,
                Address = f.Company.Address,
                LogoUrl = f.Company.LogoUrl,
                ContactEmail = f.Company.ContactEmail,
                ContactPhone = f.Company.ContactPhone,
                FollowerCount = _db.CompanyFollowers.Count(ff => ff.CompanyId == f.CompanyId),
                PortfolioItemCount = _db.PortfolioItems.Count(p => p.CompanyId == f.CompanyId),
                IsFollowedByCurrentUser = true,
                OwnerUserId = _db.Users.Where(u => u.CompanyId == f.CompanyId && (u.UserType == UserType.CompanyOwner || u.UserType == UserType.InventoryOwner)).Select(u => (int?)u.Id).FirstOrDefault()
            })
            .OrderBy(c => c.Name)
            .ToListAsync();

        return Ok(companies);
    }

    /// <summary>
    /// Upload or update a company's logo. Only accessible to CompanyAdmin of that company.
    /// </summary>
    [HttpPost("{companyId}/logo")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<IActionResult> UploadLogo(int companyId, IFormFile logo)
    {
        var company = await _db.Companies.FindAsync(companyId);
        if (company == null) return NotFound();

        // Validate it's the correct company admin
        var userCompanyId = _companyContext.CompanyId;
        if (userCompanyId != companyId && !User.IsInRole("SystemAdmin"))
            return Forbid();

        // Validate File
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
        if (!allowedTypes.Contains(logo.ContentType.ToLower()))
            return BadRequest("Invalid file type. Only JPEG, PNG, and GIF are allowed.");

        if (logo.Length > 5 * 1024 * 1024) // 5MB limit
            return BadRequest("File size exceeds 5MB limit.");

        // Delete old logo if exists
        if (!string.IsNullOrEmpty(company.LogoUrl))
        {
            await _fileStorageService.DeleteFileAsync(company.LogoUrl);
        }

        // Save the file using IFileStorageService
        var result = await _fileStorageService.SaveFileAsync(logo, "logos");
        company.LogoUrl = result.Path;
        await _db.SaveChangesAsync();

        return Ok(new { logoUrl = company.LogoUrl });
    }

    // ── Helper Methods ────────────────────────────────────────────────────────────

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token.");
        }
        return userId;
    }
}

