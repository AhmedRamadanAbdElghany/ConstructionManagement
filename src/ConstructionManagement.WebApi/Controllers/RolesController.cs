using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ConstructionManagement.WebApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRoles([FromQuery] int? companyId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _roleService.GetRolesByCompanyAsync(companyId, userId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddRoleRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var id = await _roleService.AddRoleAsync(request, userId);
            return Ok(new { Id = id });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var success = await _roleService.DeleteRoleAsync(id, userId);
            return success ? Ok() : NotFound();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AddRoleRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var success = await _roleService.UpdateRoleAsync(id, request.RoleName, request.Description, userId);
            return success ? Ok() : NotFound();
        }

        [HttpPost("permissions")]
        public async Task<IActionResult> UpdatePermissions([FromBody] UpdateRolePermissionsRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var success = await _roleService.UpdateRolePermissionsAsync(request, userId);
            return success ? Ok() : NotFound();
        }
    }
}
