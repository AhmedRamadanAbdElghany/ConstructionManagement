using ConstructionManagement.Application.DTOs.ProjectApprovalRule;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers
{
    [Authorize(Policy = "CanManageProjectSettings")]
    [Route("api/projects/{projectId}/approval-rules")]
    [ApiController]
    public class ProjectApprovalRulesController : ControllerBase
    {
        private readonly IProjectApprovalRuleService _ruleService;

        public ProjectApprovalRulesController(IProjectApprovalRuleService ruleService)
        {
            _ruleService = ruleService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRule(int projectId, [FromBody] CreateApprovalRuleRequest request)
        {
            var ruleId = await _ruleService.CreateRuleAsync(projectId, request);
            return CreatedAtAction(nameof(GetRule), new { projectId, ruleId }, new { ruleId });
        }

        [HttpGet("{ruleId}")]
        public async Task<IActionResult> GetRule(int projectId, int ruleId)
        {
            var rule = await _ruleService.GetRuleByIdAsync(projectId, ruleId);
            return rule != null ? Ok(rule) : NotFound();
        }

        [HttpGet]
        public async Task<IActionResult> GetRules(int projectId)
        {
            var rules = await _ruleService.GetRulesForProjectAsync(projectId);
            return Ok(rules);
        }
    }
}
