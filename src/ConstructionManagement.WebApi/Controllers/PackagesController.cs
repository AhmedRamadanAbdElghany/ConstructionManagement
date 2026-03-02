using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/packages")]
public class PackagesController : ControllerBase
{
    private readonly IRepository<Package> _repo;
    private readonly IUnitOfWork _uow;

    public PackagesController(IRepository<Package> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var packages = await _repo.AsQueryable().ToListAsync();
        return Ok(packages);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var pkg = await _repo.GetByIdAsync(id);
        if (pkg == null) return NotFound();
        return Ok(pkg);
    }

    [HttpPost]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> Create([FromBody] Package pkg)
    {
        await _repo.AddAsync(pkg);
        await _uow.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = pkg.Id }, pkg);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> Update(int id, [FromBody] Package pkg)
    {
        if (id != pkg.Id) return BadRequest();
        
        await _repo.UpdateAsync(pkg);
        await _uow.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> Delete(int id)
    {
        var pkg = await _repo.GetByIdAsync(id);
        if (pkg == null) return NotFound();

        await _repo.DeleteAsync(pkg);
        await _uow.SaveChangesAsync();
        return NoContent();
    }
}

