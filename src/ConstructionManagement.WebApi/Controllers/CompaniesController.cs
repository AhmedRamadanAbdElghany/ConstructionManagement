using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize(Roles = "SuperAdmin")]
[ApiController]
[Route("api/admin/companies")]
public class CompaniesController : ControllerBase
{
    private readonly IRepository<Company> _companyRepo;
    private readonly IRepository<CompanySettings> _settingsRepo;
    private readonly IUnitOfWork _uow;

    public CompaniesController(
        IRepository<Company> companyRepo, 
        IRepository<CompanySettings> settingsRepo, 
        IUnitOfWork uow)
    {
        _companyRepo = companyRepo;
        _settingsRepo = settingsRepo;
        _uow = uow;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCompanyRequest request)
    {
        var company = new Company
        {
            Name = request.Name,
            PackageId = request.PackageId,
            IsActive = true
        };
        
        await _companyRepo.AddAsync(company);
        await _uow.SaveChangesAsync();
        
        // Initial settings for the company
        var settings = new CompanySettings
        {
            CompanyId = company.Id
        };
        await _settingsRepo.AddAsync(settings);
        await _uow.SaveChangesAsync();
        
        return Ok(company);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var companies = await _companyRepo.GetAllAsync();
        return Ok(companies);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var company = await _companyRepo.GetByIdAsync(id);
        if (company == null) return NotFound();
        return Ok(company);
    }
}
