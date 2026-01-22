using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize(Policy = "SuperAdminOnly")] // or "CanManageCompanySettings"
[ApiController]
[Route("api/admin/company-settings")]
public class CompanySettingsController : ControllerBase
{
    private readonly IRepository<CompanySettings> _repo;
    private readonly IUnitOfWork _uow;

    public CompanySettingsController(IRepository<CompanySettings> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var settings = await _repo.GetByIdAsync(1);
        if (settings == null) return NotFound();
        return Ok(settings);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateCompanySettingsRequest request)
    {
        var settings = await _repo.GetByIdAsync(1);
        if (settings == null) return NotFound();

        // Map request to entity (only update provided fields)
        if (request.EnableDelayNotification.HasValue)
            settings.EnableDelayNotification = request.EnableDelayNotification.Value;
        // ... repeat for all fields ...

        await _repo.UpdateAsync(settings);
        await _uow.SaveChangesAsync();

        return NoContent();
    }
}