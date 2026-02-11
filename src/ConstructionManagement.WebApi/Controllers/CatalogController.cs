using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/catalog")]
public class CatalogController : ControllerBase
{
    private readonly IRepository<CatalogItem> _repo;
    private readonly ICompanyContext _companyContext;
    private readonly IUnitOfWork _uow;

    public CatalogController(IRepository<CatalogItem> repo, ICompanyContext companyContext, IUnitOfWork uow)
    {
        _repo = repo;
        _companyContext = companyContext;
        _uow = uow;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int? projectId)
    {
        var query = _repo.AsQueryable();
        
        // Filter by company
        if (_companyContext.CompanyId.HasValue)
        {
            query = query.Where(x => x.CompanyId == _companyContext.CompanyId.Value);
        }

        if (projectId.HasValue)
        {
            query = query.Where(x => x.ProjectId == projectId.Value || x.ProjectId == null);
        }
        else
        {
            query = query.Where(x => x.ProjectId == null);
        }

        var items = await query.ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CatalogItem item)
    {
        item.CompanyId = _companyContext.CompanyId;
        await _repo.AddAsync(item);
        await _uow.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CatalogItem item)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return NotFound();

        existing.Name = item.Name;
        existing.Description = item.Description;
        existing.Unit = item.Unit;
        existing.DefaultRate = item.DefaultRate;
        existing.Category = item.Category;
        existing.ProjectId = item.ProjectId;

        await _repo.UpdateAsync(existing);
        await _uow.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item == null) return NotFound();

        await _repo.DeleteAsync(item);
        await _uow.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _repo.AsQueryable()
            .Where(x => x.CompanyId == _companyContext.CompanyId)
            .Select(x => x.Category)
            .Where(x => !string.IsNullOrEmpty(x))
            .Distinct()
            .ToListAsync();
        return Ok(categories);
    }
}
