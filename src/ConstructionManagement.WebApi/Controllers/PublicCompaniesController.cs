using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    public PublicCompaniesController(
        IRepository<Company> companyRepo,
        ApplicationDbContext db,
        ICompanyContext companyContext,
        IFileStorageService fileStorageService)
    {
        _companyRepo = companyRepo;
        _db = db;
        _companyContext = companyContext;
        _fileStorageService = fileStorageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPublicCompanies()
    {
        var currentUserId = _companyContext.CurrentUserId ?? 0;

        // Get companies with counts
        var companies = await _companyRepo.AsQueryable()
            .IgnoreQueryFilters()
            .Where(c => c.IsActive)
            .Select(c => new PublicCompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                Address = c.Address,
                LogoUrl = c.LogoUrl,
                CompletedProjectsCount = c.Projects.Count(p => p.Status == "Completed"),
                SubscriberCount = _db.CompanyFollowers.Count(f => f.CompanyId == c.Id),
                IsSubscribed = _db.CompanyFollowers.Any(f => f.CompanyId == c.Id && f.UserId == currentUserId)
            })
            .ToListAsync();

        return Ok(companies);
    }

    /// <summary>
    /// Upload or update a company's logo. Only accessible to CompanyAdmin of that company.
    /// </summary>
    [HttpPost("{companyId}/logo")]
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
    public async Task<IActionResult> UploadLogo(int companyId, IFormFile logo)
    {
        var company = await _db.Companies.FindAsync(companyId);
        if (company == null) return NotFound();

        // Validate it's the correct company admin
        var userCompanyId = _companyContext.CompanyId;
        if (userCompanyId != companyId && !User.IsInRole("SuperAdmin"))
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
}
