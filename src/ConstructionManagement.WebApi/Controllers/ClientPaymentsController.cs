using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Infrastructure.Services;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// Controller for managing client payments.
/// </summary>
[ApiController]
public class ClientPaymentsController : BaseApiController
{
    private readonly IClientPaymentService _paymentService;
    private readonly IFinancialSummaryService _financialSummaryService;
    private readonly ICompanyContext _companyContext;
    private readonly ILogger<ClientPaymentsController> _logger;

    public ClientPaymentsController(
        IClientPaymentService paymentService,
        IFinancialSummaryService financialSummaryService,
        ICompanyContext companyContext,
        ILogger<ClientPaymentsController> logger)
    {
        _paymentService = paymentService;
        _financialSummaryService = financialSummaryService;
        _companyContext = companyContext;
        _logger = logger;
    }

    #region Payments CRUD

    /// <summary>
    /// Get all client payments with filtering and pagination.
    /// </summary>
    [HttpGet("api/client-payments")]
    [Authorize]
    public async Task<IActionResult> GetAll([FromQuery] ClientPaymentFilterRequest filter)
    {
        var companyId = _companyContext.CompanyId;
        if (!companyId.HasValue)
            return Unauthorized(new { message = "لم يتم تحديد الشركة" });

        var result = await _paymentService.GetPaymentsAsync(filter, companyId.Value);
        return Ok(result);
    }

    /// <summary>
    /// Get payments for a specific project.
    /// </summary>
    [HttpGet("api/projects/{projectId}/client-payments")]
    [Authorize]
    public async Task<IActionResult> GetForProject(int projectId, [FromQuery] string? status = null)
    {
        var payments = await _paymentService.GetPaymentsForProjectAsync(projectId, status);
        return Ok(payments);
    }

    /// <summary>
    /// Get a specific payment by ID.
    /// </summary>
    [HttpGet("api/client-payments/{paymentId}")]
    [Authorize]
    public async Task<IActionResult> GetById(int paymentId)
    {
        var payment = await _paymentService.GetPaymentByIdAsync(paymentId);
        if (payment == null)
            return NotFound(new { message = "لم يتم العثور على الدفعة" });

        return Ok(payment);
    }

    /// <summary>
    /// Create a new client payment.
    /// </summary>
    [HttpPost("api/projects/{projectId}/client-payments")]
    [Authorize]
    public async Task<IActionResult> Create(int projectId, [FromBody] CreateClientPaymentRequest request)
    {
        try
        {
            var companyId = _companyContext.CompanyId;
            if (!companyId.HasValue)
                return Unauthorized(new { message = "لم يتم تحديد الشركة" });

            var userId = GetUserId();
            
            // Ensure project ID matches
            var paymentRequest = request with { ProjectId = projectId };
            
            var paymentId = await _paymentService.CreatePaymentAsync(paymentRequest, userId, companyId.Value);
            
            // Check for financial alerts
            await _financialSummaryService.CheckAndTriggerAlertsAsync(projectId);

            return CreatedAtAction(nameof(GetById), new { paymentId }, new { paymentId, message = "تم إنشاء الدفعة بنجاح" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating client payment");
            return StatusCode(500, new { message = "حدث خطأ أثناء إنشاء الدفعة" });
        }
    }

    /// <summary>
    /// Update an existing payment.
    /// </summary>
    [HttpPut("api/client-payments/{paymentId}")]
    [Authorize]
    public async Task<IActionResult> Update(int paymentId, [FromBody] UpdateClientPaymentRequest request)
    {
        try
        {
            var userId = GetUserId();
            var success = await _paymentService.UpdatePaymentAsync(paymentId, request, userId);

            if (!success)
                return BadRequest(new { message = "لا يمكن تعديل هذه الدفعة" });

            return Ok(new { message = "تم تحديث الدفعة بنجاح" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating client payment {PaymentId}", paymentId);
            return StatusCode(500, new { message = "حدث خطأ أثناء تحديث الدفعة" });
        }
    }

    /// <summary>
    /// Delete a payment.
    /// </summary>
    [HttpDelete("api/client-payments/{paymentId}")]
    [Authorize]
    public async Task<IActionResult> Delete(int paymentId)
    {
        try
        {
            var userId = GetUserId();
            var success = await _paymentService.DeletePaymentAsync(paymentId, userId);

            if (!success)
                return BadRequest(new { message = "لا يمكن حذف هذه الدفعة" });

            return Ok(new { message = "تم حذف الدفعة بنجاح" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting client payment {PaymentId}", paymentId);
            return StatusCode(500, new { message = "حدث خطأ أثناء حذف الدفعة" });
        }
    }

    #endregion

    #region Payment Actions

    /// <summary>
    /// Confirm a pending payment.
    /// </summary>
    [HttpPost("api/client-payments/{paymentId}/confirm")]
    [Authorize]
    public async Task<IActionResult> Confirm(int paymentId, [FromBody] ConfirmPaymentRequest? request = null)
    {
        try
        {
            var userId = GetUserId();
            var success = await _paymentService.ConfirmPaymentAsync(paymentId, userId, request);

            if (!success)
                return BadRequest(new { message = "لا يمكن تأكيد هذه الدفعة" });

            return Ok(new { message = "تم تأكيد الدفعة بنجاح" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming client payment {PaymentId}", paymentId);
            return StatusCode(500, new { message = "حدث خطأ أثناء تأكيد الدفعة" });
        }
    }

    /// <summary>
    /// Cancel a payment.
    /// </summary>
    [HttpPost("api/client-payments/{paymentId}/cancel")]
    [Authorize]
    public async Task<IActionResult> Cancel(int paymentId, [FromBody] CancelPaymentRequest? request = null)
    {
        try
        {
            var userId = GetUserId();
            var success = await _paymentService.CancelPaymentAsync(paymentId, userId, request?.Reason);

            if (!success)
                return BadRequest(new { message = "لا يمكن إلغاء هذه الدفعة" });

            return Ok(new { message = "تم إلغاء الدفعة بنجاح" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling client payment {PaymentId}", paymentId);
            return StatusCode(500, new { message = "حدث خطأ أثناء إلغاء الدفعة" });
        }
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Get payment statistics.
    /// </summary>
    [HttpGet("api/client-payments/statistics")]
    [Authorize]
    public async Task<IActionResult> GetStatistics([FromQuery] int? projectId = null)
    {
        var companyId = _companyContext.CompanyId;
        var stats = await _paymentService.GetStatisticsAsync(projectId, companyId);
        return Ok(stats);
    }

    #endregion

    #region Financial Summary

    /// <summary>
    /// Get financial summary for a project.
    /// </summary>
    [HttpGet("api/projects/{projectId}/financial-summary")]
    [Authorize]
    public async Task<IActionResult> GetFinancialSummary(int projectId)
    {
        try
        {
            var summary = await _financialSummaryService.GetProjectFinancialSummaryAsync(projectId);
            return Ok(summary);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting financial summary for project {ProjectId}", projectId);
            return StatusCode(500, new { message = "حدث خطأ أثناء الحصول على الملخص المالي" });
        }
    }

    /// <summary>
    /// Get financial summary for all company projects.
    /// </summary>
    [HttpGet("api/company/financial-summary")]
    [Authorize]
    public async Task<IActionResult> GetCompanyFinancialSummary()
    {
        var companyId = _companyContext.CompanyId;
        if (!companyId.HasValue)
            return Unauthorized(new { message = "لم يتم تحديد الشركة" });

        var summaries = await _financialSummaryService.GetCompanyFinancialSummaryAsync(companyId.Value);
        return Ok(summaries);
    }

    #endregion

    #region Helper Methods



    #endregion
}

/// <summary>
/// Request for cancelling a payment.
/// </summary>
public record CancelPaymentRequest(string? Reason);
