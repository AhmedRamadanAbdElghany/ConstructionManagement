using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// Controller for managing invoices in the construction management system.
/// Supports both Disbursement Authorization (اذن صرف) and Purchase Invoice (فاتورة شراء).
/// </summary>
[Authorize]
[ApiController]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly IDailyLogService _dailyLogService;
    private readonly ICompanyContext _companyContext;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<InvoicesController> _logger;

    public InvoicesController(
        IInvoiceService invoiceService,
        IDailyLogService dailyLogService,
        ICompanyContext companyContext,
        IFileStorageService fileStorageService,
        ILogger<InvoicesController> logger)
    {
        _invoiceService = invoiceService;
        _dailyLogService = dailyLogService;
        _companyContext = companyContext;
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    #region Invoice CRUD

    /// <summary>
    /// Create a new invoice for a project item
    /// </summary>
    [HttpPost("api/projects/{projectId}/items/{itemId}/invoices")]
    public async Task<IActionResult> CreateForItem(int projectId, int itemId, [FromBody] CreateInvoiceRequest request)
    {
        try
        {
            var companyId = _companyContext.CompanyId
                ?? throw new UnauthorizedAccessException("Company not found");

            var userId = GetUserId();

            // Check if day is closed
            var today = (request.InvoiceDate ?? DateTime.UtcNow).Date;
            var isClosed = await _dailyLogService.IsDayClosedForItemAsync(itemId, today);
            if (isClosed)
                return BadRequest(new { message = "اليوم مقفول لهذا البند، لا يمكن إضافة فواتير جديدة" });

            var invoiceId = await _invoiceService.CreateInvoiceAsync(request, userId, companyId);

            return CreatedAtAction(
                nameof(GetById),
                new { invoiceId },
                new { invoiceId, message = "تم إنشاء الفاتورة بنجاح" }
            );
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating invoice for item {ItemId}", itemId);
            return StatusCode(500, new { message = "حدث خطأ أثناء إنشاء الفاتورة" });
        }
    }

    /// <summary>
    /// Create a new invoice (alternative endpoint)
    /// </summary>
    [HttpPost("api/invoices")]
    public async Task<IActionResult> Create([FromBody] CreateInvoiceRequest request)
    {
        try
        {
            var companyId = _companyContext.CompanyId
                ?? throw new UnauthorizedAccessException("Company not found");

            var userId = GetUserId();

            var invoiceId = await _invoiceService.CreateInvoiceAsync(request, userId, companyId);

            return CreatedAtAction(
                nameof(GetById),
                new { invoiceId },
                new { invoiceId, message = "تم إنشاء الفاتورة بنجاح" }
            );
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating invoice");
            return StatusCode(500, new { message = "حدث خطأ أثناء إنشاء الفاتورة" });
        }
    }

    /// <summary>
    /// Get invoice by ID
    /// </summary>
    [HttpGet("api/invoices/{invoiceId}")]
    public async Task<IActionResult> GetById(int invoiceId)
    {
        var invoice = await _invoiceService.GetInvoiceByIdAsync(invoiceId);
        if (invoice == null)
            return NotFound(new { message = "الفاتورة غير موجودة" });

        return Ok(invoice);
    }

    /// <summary>
    /// Update an existing invoice
    /// </summary>
    [HttpPut("api/invoices/{invoiceId}")]
    public async Task<IActionResult> Update(int invoiceId, [FromBody] UpdateInvoiceRequest request)
    {
        try
        {
            var userId = GetUserId();
            var success = await _invoiceService.UpdateInvoiceAsync(invoiceId, request, userId);

            if (!success)
                return NotFound(new { message = "الفاتورة غير موجودة أو لا يمكن تعديلها" });

            return Ok(new { message = "تم تحديث الفاتورة بنجاح" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating invoice {InvoiceId}", invoiceId);
            return StatusCode(500, new { message = "حدث خطأ أثناء تحديث الفاتورة" });
        }
    }

    /// <summary>
    /// Delete an invoice
    /// </summary>
    [HttpDelete("api/invoices/{invoiceId}")]
    public async Task<IActionResult> Delete(int invoiceId)
    {
        try
        {
            var userId = GetUserId();
            var success = await _invoiceService.DeleteInvoiceAsync(invoiceId, userId);

            if (!success)
                return NotFound(new { message = "الفاتورة غير موجودة أو لا يمكن حذفها" });

            return Ok(new { message = "تم حذف الفاتورة بنجاح" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting invoice {InvoiceId}", invoiceId);
            return StatusCode(500, new { message = "حدث خطأ أثناء حذف الفاتورة" });
        }
    }

    #endregion

    #region Invoice Listing

    /// <summary>
    /// Get all invoices with filtering and pagination
    /// </summary>
    [HttpGet("api/invoices")]
    public async Task<IActionResult> GetAll([FromQuery] InvoiceFilterRequest filter)
    {
        try
        {
            var companyId = _companyContext.CompanyId;
            if (!companyId.HasValue)
                return Unauthorized(new { message = "Company not found" });

            var result = await _invoiceService.GetInvoicesAsync(filter, companyId.Value);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting invoices");
            return StatusCode(500, new { message = "حدث خطأ أثناء جلب الفواتير" });
        }
    }

    /// <summary>
    /// Get invoices for a specific project
    /// </summary>
    [HttpGet("api/projects/{projectId}/invoices")]
    public async Task<IActionResult> GetForProject(int projectId, [FromQuery] string? type = null, [FromQuery] string? status = null)
    {
        var invoices = await _invoiceService.GetInvoicesForProjectAsync(projectId, type, status);
        return Ok(invoices);
    }

    /// <summary>
    /// Get invoices for a specific project item
    /// </summary>
    [HttpGet("api/projects/{projectId}/items/{itemId}/invoices")]
    public async Task<IActionResult> GetForItem(int projectId, int itemId)
    {
        var invoices = await _invoiceService.GetInvoicesForItemAsync(itemId);
        return Ok(invoices);
    }

    /// <summary>
    /// Get pending invoices for approval
    /// </summary>
    [HttpGet("api/invoices/pending")]
    [Authorize(Policy = "CanReviewInvoices")]
    public async Task<IActionResult> GetPending()
    {
        var companyId = _companyContext.CompanyId;
        if (!companyId.HasValue)
            return Unauthorized(new { message = "Company not found" });

        var invoices = await _invoiceService.GetPendingInvoicesAsync(companyId.Value);
        return Ok(invoices);
    }

    /// <summary>
    /// Get invoice statistics
    /// </summary>
    [HttpGet("api/invoices/statistics")]
    public async Task<IActionResult> GetStatistics([FromQuery] int? projectId = null)
    {
        var companyId = _companyContext.CompanyId;
        var stats = await _invoiceService.GetInvoiceStatisticsAsync(projectId, companyId);
        return Ok(stats);
    }

    #endregion

    #region Invoice Review

    /// <summary>
    /// Review (approve/reject) an invoice
    /// </summary>
    [HttpPut("api/invoices/{invoiceId}/review")]
    [Authorize(Policy = "CanReviewInvoices")]
    public async Task<IActionResult> Review(int invoiceId, [FromBody] ReviewInvoiceRequest request)
    {
        try
        {
            var userId = GetUserId();
            var success = await _invoiceService.ReviewInvoiceAsync(invoiceId, request, userId);

            if (!success)
                return BadRequest(new { message = "لا يمكن مراجعة الفاتورة (غير موجودة أو تمت مراجعتها)" });

            return Ok(new { message = request.Status == "Approved" ? "تم اعتماد الفاتورة" : "تم رفض الفاتورة" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reviewing invoice {InvoiceId}", invoiceId);
            return StatusCode(500, new { message = "حدث خطأ أثناء مراجعة الفاتورة" });
        }
    }

    #endregion

    #region Invoice Images

    /// <summary>
    /// Add an image to an invoice
    /// </summary>
    [HttpPost("api/invoices/{invoiceId}/images")]
    public async Task<IActionResult> AddImage(int invoiceId, IFormFile file, [FromForm] string? description = null)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "الملف مطلوب" });

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest(new { message = "نوع الملف غير مدعوم. يرجى رفع صورة (JPEG, PNG, GIF, WebP)" });

            // Validate file size (max 10MB)
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { message = "حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت" });

            // Store file
            var filePath = await _fileStorageService.SaveFileAsync(file, "invoices");

            var imageId = await _invoiceService.AddInvoiceImageAsync(
                invoiceId,
                filePath.Path,
                file.FileName,
                file.Length,
                file.ContentType,
                description
            );

            return Ok(new { imageId, message = "تم رفع الصورة بنجاح" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding image to invoice {InvoiceId}", invoiceId);
            return StatusCode(500, new { message = "حدث خطأ أثناء رفع الصورة" });
        }
    }

    /// <summary>
    /// Remove an image from an invoice
    /// </summary>
    [HttpDelete("api/invoices/{invoiceId}/images/{imageId}")]
    public async Task<IActionResult> RemoveImage(int invoiceId, int imageId)
    {
        try
        {
            var success = await _invoiceService.RemoveInvoiceImageAsync(invoiceId, imageId);

            if (!success)
                return NotFound(new { message = "الصورة غير موجودة" });

            return Ok(new { message = "تم حذف الصورة بنجاح" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing image {ImageId} from invoice {InvoiceId}", imageId, invoiceId);
            return StatusCode(500, new { message = "حدث خطأ أثناء حذف الصورة" });
        }
    }

    /// <summary>
    /// Reorder invoice images
    /// </summary>
    [HttpPut("api/invoices/{invoiceId}/images/reorder")]
    public async Task<IActionResult> ReorderImages(int invoiceId, [FromBody] Dictionary<int, int> imageOrder)
    {
        try
        {
            var success = await _invoiceService.ReorderInvoiceImagesAsync(invoiceId, imageOrder);
            return Ok(new { message = "تم إعادة ترتيب الصور بنجاح" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reordering images for invoice {InvoiceId}", invoiceId);
            return StatusCode(500, new { message = "حدث خطأ أثناء إعادة ترتيب الصور" });
        }
    }

    #endregion

    #region Legacy Endpoints (for backward compatibility)

    /// <summary>
    /// Legacy endpoint for creating invoice for an item
    /// </summary>
    [Obsolete("Use CreateForItem instead")]
    [HttpPost("api/items/{itemId}/invoices")]
    public async Task<IActionResult> CreateLegacy(int itemId, [FromBody] CreateInvoiceRequest request)
    {
        // Check if day is closed
        var today = (request.InvoiceDate ?? DateTime.UtcNow).Date;
        var isClosed = await _dailyLogService.IsDayClosedForItemAsync(itemId, today);
        if (isClosed)
            return BadRequest(new { message = "اليوم مقفول لهذا البند، لا يمكن إضافة فواتير جديدة" });

        var companyId = _companyContext.CompanyId;
        if (!companyId.HasValue)
            return Unauthorized(new { message = "Company not found" });

        var userId = GetUserId();
        var invoiceId = await _invoiceService.CreateInvoiceAsync(request, userId, companyId.Value);

        return CreatedAtAction(nameof(GetById), new { invoiceId }, new { invoiceId });
    }

    #endregion

    #region Private Helpers

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("User not authenticated");

        return userId;
    }

    #endregion
}
