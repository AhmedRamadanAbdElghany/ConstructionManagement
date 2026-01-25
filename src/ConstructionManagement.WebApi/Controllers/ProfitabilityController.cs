using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize(Policy = "CanViewProjectFinancials")] // ← أضف Policy جديدة (هنعرفها في Program.cs)
[Route("api/projects/{projectId}/profitability")]
[ApiController]
public class ProfitabilityController : ControllerBase
{
    private readonly IProjectTransactionService _transactionService;

    public ProfitabilityController(IProjectTransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    /// <summary>
    /// جلب الربحية اللحظية لمشروع كامل (إجمالي المصروفات والربح لكل البنود)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProjectProfitability(int projectId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var profitability = await _transactionService.GetProjectProfitabilityAsync(projectId);

        if (profitability == null)
            return NotFound("المشروع غير موجود أو ليس له بيانات مالية");

        return Ok(profitability);
    }

    /// <summary>
    /// جلب الربحية اللحظية لبند معين
    /// </summary>
    [HttpGet("item/{boqItemId}")]
    public async Task<IActionResult> GetItemProfitability(int projectId, int boqItemId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var profitability = await _transactionService.GetItemProfitabilityAsync(projectId, boqItemId);

        if (profitability == null)
            return NotFound("البند غير موجود أو ليس له مصروفات");

        return Ok(profitability);
    }

    // NOTE: Add tests for project/item profitability endpoints.
}