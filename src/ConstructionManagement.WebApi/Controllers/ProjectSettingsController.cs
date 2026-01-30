
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers
{
    [Authorize(Policy = "CanEditProject")]  // أو Policy خاصة للإعدادات
    [Route("api/projects/{projectId}/settings")]
    [ApiController]
    public class ProjectSettingsController : ControllerBase
    {
        private readonly IProjectSettingsService _settingsService;

        public ProjectSettingsController(IProjectSettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings(int projectId)
        {
            var settings = await _settingsService.GetSettingsAsync(projectId);
            return Ok(settings);
        }

        [HttpPut]
        [Authorize(Policy = "CanEditProject")]
        public async Task<IActionResult> UpdateSettings(int projectId, [FromBody] UpdateProjectSettingsRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _settingsService.UpdateSettingsAsync(projectId, request, userId);
            return Ok("تم تحديث إعدادات المشروع بنجاح");
        }
    }
}
