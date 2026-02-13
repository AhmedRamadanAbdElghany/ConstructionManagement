using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/companies")]
public class CompanyPackagesController : ControllerBase
{
    private readonly IRepository<CompanyPackage> _repo;
    private readonly ICompanyContext _companyContext;
    private readonly IUnitOfWork _uow;

    public CompanyPackagesController(IRepository<CompanyPackage> repo, ICompanyContext companyContext, IUnitOfWork uow)
    {
        _repo = repo;
        _companyContext = companyContext;
        _uow = uow;
    }

    [HttpGet("packages")]
    public async Task<IActionResult> GetPackages()
    {
        if (!_companyContext.CompanyId.HasValue) return BadRequest("Company ID missing");

        var packages = await _repo.AsQueryable()
            .Where(x => x.CompanyId == _companyContext.CompanyId.Value)
            .ToListAsync();
            
        return Ok(packages);
    }

    [HttpGet("{companyId}/packages")]
    public async Task<IActionResult> GetCompanyPackages(int companyId)
    {
        var packages = await _repo.AsQueryable()
            .Where(x => x.CompanyId == companyId)
            .ToListAsync();
            
        return Ok(packages);
    }

    [HttpPost("packages")]
    public async Task<IActionResult> CreatePackage([FromBody] CompanyPackage pkg)
    {
        if (!_companyContext.CompanyId.HasValue) return BadRequest("Company ID missing");
        pkg.CompanyId = _companyContext.CompanyId.Value;
        
        await _repo.AddAsync(pkg);
        await _uow.SaveChangesAsync();
        return Ok(pkg);
    }

    [HttpPost("{companyId}/packages")]
    public async Task<IActionResult> CreatePackageForCompany(int companyId, [FromBody] CompanyPackage pkg)
    {
        pkg.CompanyId = companyId;
        await _repo.AddAsync(pkg);
        await _uow.SaveChangesAsync();
        return Ok(pkg);
    }

    [HttpPut("packages/{id}")]
    public async Task<IActionResult> UpdatePackage(int id, [FromBody] CompanyPackage pkg)
    {
        if (id != pkg.Id) return BadRequest();

        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return NotFound();

        // Update fields
        existing.Name = pkg.Name;
        existing.Description = pkg.Description;
        existing.Price = pkg.Price;
        existing.IncludedItemsDescription = pkg.IncludedItemsDescription;
        existing.VariationCalculation = pkg.VariationCalculation;

        await _repo.UpdateAsync(existing);
        await _uow.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("packages/{id}")]
    public async Task<IActionResult> DeletePackage(int id)
    {
        var pkg = await _repo.GetByIdAsync(id);
        if (pkg == null) return NotFound();

        await _repo.DeleteAsync(pkg);
        await _uow.SaveChangesAsync();
        return NoContent();
    }
}
