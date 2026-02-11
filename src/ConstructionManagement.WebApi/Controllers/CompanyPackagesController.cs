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

    [HttpPost("packages")]
    public async Task<IActionResult> CreatePackage([FromBody] CompanyPackage pkg)
    {
        pkg.CompanyId = _companyContext.CompanyId;
        await _repo.AddAsync(pkg);
        await _uow.SaveChangesAsync();
        return Ok(pkg);
    }
}
