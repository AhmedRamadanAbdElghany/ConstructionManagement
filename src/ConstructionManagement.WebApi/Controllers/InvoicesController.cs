using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize]
[Route("api/items/{itemId}/invoices")]
[ApiController]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly IDailyLogService _dailyLogService;

    public InvoicesController(IInvoiceService invoiceService, IDailyLogService dailyLogService)
    {
        _invoiceService = invoiceService;
        _dailyLogService = dailyLogService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(int itemId, [FromBody] CreateInvoiceRequest request)
    {
        // 1. التحقق من التقفيل اليومي قبل إضافة فاتورة
        var today = DateTime.UtcNow.Date;
        var isClosed = await _dailyLogService.IsDayClosedForItemAsync(itemId, today);
        if (isClosed)
            return BadRequest("اليوم مقفول لهذا البند، لا يمكن إضافة فواتير جديدة");

        // 2. إنشاء الفاتورة
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var invoiceId = await _invoiceService.CreateInvoiceAsync(itemId, request, userId);

        return CreatedAtAction(nameof(Get), new { invoiceId }, new { invoiceId });
    }

    [HttpGet("{invoiceId}")]
    public async Task<IActionResult> Get(int invoiceId)
    {
        var invoice = await _invoiceService.GetInvoiceByIdAsync(invoiceId);
        if (invoice == null)
            return NotFound();

        return Ok(invoice);
    }

    [HttpPut("{invoiceId}/review")]
    [Authorize(Policy = "CanReviewInvoices")]
    public async Task<IActionResult> Review(int invoiceId, [FromBody] ReviewInvoiceRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var success = await _invoiceService.ReviewInvoiceAsync(invoiceId, request, userId);

        return success
            ? Ok("تمت مراجعة الفاتورة بنجاح")
            : BadRequest("لا يمكن مراجعة الفاتورة (غير موجودة أو تمت مراجعتها)");
    }
}