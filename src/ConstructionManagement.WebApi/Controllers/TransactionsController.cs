using ConstructionManagement.Application.DTOs.Transaction;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize]
[Route("api/projects/{projectId}/transactions")]
[ApiController]
public class TransactionsController : ControllerBase
{
    private readonly IProjectTransactionService _transactionService;

    public TransactionsController(IProjectTransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    /// <summary>
    /// إضافة معاملة مالية جديدة (مصروف أو فاتورة)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "CanAddTransaction")]
    [RequestSizeLimit(20_000_000)] // 20 MB للفواتير
    public async Task<IActionResult> Create(int projectId, [FromForm] CreateTransactionRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var transactionId = await _transactionService.CreateTransactionAsync(projectId, request, userId);

        return CreatedAtAction(nameof(Get), new { projectId, transactionId }, new { transactionId });
    }

    /// <summary>
    /// جلب تفاصيل معاملة مالية معينة
    /// </summary>
    [HttpGet("{transactionId}")]
    [Authorize(Policy = "CanViewTransactions")]
    public async Task<IActionResult> Get(int projectId, int transactionId)
    {
        var transaction = await _transactionService.GetTransactionByIdAsync(transactionId);

        if (transaction == null || transaction.ProjectId != projectId)
            return NotFound("المعاملة غير موجودة أو لا تنتمي لهذا المشروع");

        return Ok(transaction);
    }

    /// <summary>
    /// جلب كل المعاملات المالية للمشروع (أو لبند معين)
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "CanViewTransactions")]
    public async Task<IActionResult> GetList(int projectId, [FromQuery] int? boqItemId = null)
    {
        var transactions = await _transactionService.GetTransactionsForProjectAsync(projectId, boqItemId);
        return Ok(transactions);
    }

    /// <summary>
    /// مراجعة معاملة مالية (موافقة أو رفض)
    /// </summary>
    [HttpPut("{transactionId}/review")]
    [Authorize(Policy = "CanReviewTransactions")]
    public async Task<IActionResult> Review(int projectId, int transactionId, [FromBody] ReviewTransactionRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var success = await _transactionService.ReviewTransactionAsync(transactionId, request, userId);

        if (!success)
            return BadRequest("لا يمكن مراجعة المعاملة (غير موجودة أو تمت مراجعتها مسبقًا)");

        return Ok("تمت المراجعة بنجاح");
    }
}