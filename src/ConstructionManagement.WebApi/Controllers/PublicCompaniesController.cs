using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class PublicCompaniesController : ControllerBase
{
    private readonly IRepository<Company> _companyRepo;

    public PublicCompaniesController(IRepository<Company> companyRepo)
    {
        _companyRepo = companyRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetPublicCompanies()
    {
        var companies = await _companyRepo.AsQueryable()
            .Where(c => c.IsActive)
            .Select(c => new PublicCompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                Address = c.Address,
                LogoUrl = c.LogoUrl
            })
            .ToListAsync();

        return Ok(companies);
    }
}
