using System;
using System.Security.Claims;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FinancialReportsController : ControllerBase
    {
        private readonly IFinancialReportService _reportService;

        public FinancialReportsController(IFinancialReportService reportService)
        {
            _reportService = reportService;
        }

        /// <summary>
        /// Generate a comprehensive financial report for a company
        /// </summary>
        [HttpPost("financial")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> GenerateFinancialReport([FromBody] FinancialReportRequest request)
        {
            // Company isolation: ensure user can only access their own company's reports
            var userCompanyId = GetCompanyId();
            if (!User.IsInRole("SuperAdmin") && request.CompanyId != userCompanyId)
            {
                return Forbid();
            }
            
            var result = await _reportService.GenerateFinancialReportAsync(request);
            
            if (!result.Success)
                return BadRequest(new { error = result.ErrorMessage });

            return File(result.FileContent!, result.ContentType!, result.FileName!);
        }

        /// <summary>
        /// Get financial report data for preview (without export)
        /// </summary>
        [HttpPost("financial/preview")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<FinancialReportData>> GetFinancialReportPreview([FromBody] FinancialReportRequest request)
        {
            var data = await _reportService.GetFinancialReportDataAsync(request);
            return Ok(data);
        }

        /// <summary>
        /// Generate a detailed financial report for a specific project
        /// </summary>
        [HttpPost("project")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> GenerateProjectFinancialReport([FromBody] ProjectFinancialReportRequest request)
        {
            var result = await _reportService.GenerateProjectFinancialReportAsync(request);
            
            if (!result.Success)
                return BadRequest(new { error = result.ErrorMessage });

            return File(result.FileContent!, result.ContentType!, result.FileName!);
        }

        /// <summary>
        /// Get project financial report data for preview
        /// </summary>
        [HttpPost("project/preview")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<ProjectFinancialReportData>> GetProjectFinancialReportPreview([FromBody] ProjectFinancialReportRequest request)
        {
            var data = await _reportService.GetProjectFinancialReportDataAsync(request);
            return Ok(data);
        }

        /// <summary>
        /// Generate a cash flow report
        /// </summary>
        [HttpPost("cash-flow")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> GenerateCashFlowReport([FromBody] CashFlowReportRequest request)
        {
            var result = await _reportService.GenerateCashFlowReportAsync(request);
            
            if (!result.Success)
                return BadRequest(new { error = result.ErrorMessage });

            return File(result.FileContent!, result.ContentType!, result.FileName!);
        }

        /// <summary>
        /// Get cash flow report data for preview
        /// </summary>
        [HttpPost("cash-flow/preview")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<CashFlowReportData>> GetCashFlowReportPreview([FromBody] CashFlowReportRequest request)
        {
            var data = await _reportService.GetCashFlowReportDataAsync(request);
            return Ok(data);
        }

        /// <summary>
        /// Generate a profit and loss statement
        /// </summary>
        [HttpPost("profit-loss")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> GenerateProfitLossReport([FromBody] ProfitLossReportRequest request)
        {
            var result = await _reportService.GenerateProfitLossReportAsync(request);
            
            if (!result.Success)
                return BadRequest(new { error = result.ErrorMessage });

            return File(result.FileContent!, result.ContentType!, result.FileName!);
        }

        /// <summary>
        /// Get profit and loss report data for preview
        /// </summary>
        [HttpPost("profit-loss/preview")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<ProfitLossReportData>> GetProfitLossReportPreview([FromBody] ProfitLossReportRequest request)
        {
            var data = await _reportService.GetProfitLossReportDataAsync(request);
            return Ok(data);
        }

        /// <summary>
        /// Generate a tax report
        /// </summary>
        [HttpPost("tax")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> GenerateTaxReport([FromBody] TaxReportRequest request)
        {
            // Company isolation: ensure user can only access their own company's reports
            var userCompanyId = GetCompanyId();
            if (!User.IsInRole("SuperAdmin") && request.CompanyId != userCompanyId)
            {
                return Forbid();
            }
            
            var result = await _reportService.GenerateTaxReportAsync(request);
            
            if (!result.Success)
                return BadRequest(new { error = result.ErrorMessage });

            return File(result.FileContent!, result.ContentType!, result.FileName!);
        }

        private int? GetCompanyId()
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim) || !int.TryParse(companyIdClaim, out var companyId))
            {
                return null;
            }
            return companyId;
        }
    }
}
