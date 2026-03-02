using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CurrenciesController : ControllerBase
    {
        private readonly IMultiCurrencyService _service;

        public CurrenciesController(IMultiCurrencyService service)
        {
            _service = service;
        }

        #region Currency Management

        [HttpGet]
        public async Task<ActionResult<List<CurrencyDto>>> GetCurrencies()
        {
            var currencies = await _service.GetCurrenciesAsync();
            return Ok(currencies);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CurrencyDto>> GetCurrency(int id)
        {
            var currency = await _service.GetCurrencyAsync(id);
            return Ok(currency);
        }

        [HttpGet("code/{code}")]
        public async Task<ActionResult<CurrencyDto>> GetCurrencyByCode(string code)
        {
            var currency = await _service.GetCurrencyByCodeAsync(code);
            if (currency == null)
                return NotFound();
            return Ok(currency);
        }

        [HttpPost]
        [Authorize(Roles = "SystemAdmin")]
        public async Task<ActionResult<CurrencyDto>> CreateCurrency([FromBody] CreateCurrencyRequest request)
        {
            var currency = await _service.CreateCurrencyAsync(request);
            return CreatedAtAction(nameof(GetCurrency), new { id = currency.Id }, currency);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "SystemAdmin")]
        public async Task<ActionResult<CurrencyDto>> UpdateCurrency(int id, [FromBody] UpdateCurrencyRequest request)
        {
            var currency = await _service.UpdateCurrencyAsync(id, request);
            return Ok(currency);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SystemAdmin")]
        public async Task<ActionResult> DeleteCurrency(int id)
        {
            await _service.DeleteCurrencyAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/set-default")]
        [Authorize(Roles = "SystemAdmin")]
        public async Task<ActionResult> SetDefaultCurrency(int id)
        {
            await _service.SetDefaultCurrencyAsync(id);
            return Ok();
        }

        #endregion

        #region Exchange Rates

        [HttpGet("rates")]
        public async Task<ActionResult<List<ExchangeRateDto>>> GetAllExchangeRates()
        {
            var rates = await _service.GetAllExchangeRatesAsync();
            return Ok(rates);
        }

        [HttpGet("rates/{fromCurrencyId}/{toCurrencyId}")]
        public async Task<ActionResult<ExchangeRateDto>> GetExchangeRate(
            int fromCurrencyId,
            int toCurrencyId,
            [FromQuery] DateTime? asOfDate)
        {
            var rate = await _service.GetExchangeRateAsync(fromCurrencyId, toCurrencyId, asOfDate);
            return Ok(rate);
        }

        [HttpGet("{currencyId}/rates")]
        public async Task<ActionResult<List<ExchangeRateDto>>> GetExchangeRatesForCurrency(int currencyId)
        {
            var rates = await _service.GetExchangeRatesForCurrencyAsync(currencyId);
            return Ok(rates);
        }

        [HttpPost("rates")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<ExchangeRateDto>> SetExchangeRate([FromBody] CreateExchangeRateRequest request)
        {
            var rate = await _service.SetExchangeRateAsync(request);
            return Ok(rate);
        }

        [HttpPost("rates/bulk")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<ExchangeRateDto>>> BulkSetExchangeRates([FromBody] BulkExchangeRateRequest request)
        {
            var rates = await _service.BulkSetExchangeRatesAsync(request);
            return Ok(rates);
        }

        [HttpPut("rates/{id}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<ExchangeRateDto>> UpdateExchangeRate(int id, [FromBody] UpdateExchangeRateRequest request)
        {
            var rate = await _service.UpdateExchangeRateAsync(id, request);
            return Ok(rate);
        }

        [HttpDelete("rates/{id}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult> DeleteExchangeRate(int id)
        {
            await _service.DeleteExchangeRateAsync(id);
            return NoContent();
        }

        [HttpGet("rates/history/{fromCurrencyId}/{toCurrencyId}")]
        public async Task<ActionResult<ExchangeRateHistoryDto>> GetExchangeRateHistory(
            int fromCurrencyId,
            int toCurrencyId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var history = await _service.GetExchangeRateHistoryAsync(fromCurrencyId, toCurrencyId, startDate, endDate);
            return Ok(history);
        }

        [HttpPost("rates/fetch/{baseCurrencyId}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<ExchangeRateDto>>> FetchLatestRates(int baseCurrencyId, [FromQuery] string? source)
        {
            var rates = await _service.FetchLatestRatesAsync(baseCurrencyId, source);
            return Ok(rates);
        }

        #endregion

        #region Currency Conversion

        [HttpPost("convert")]
        public async Task<ActionResult<ConvertCurrencyResponse>> ConvertCurrency([FromBody] ConvertCurrencyRequest request)
        {
            var result = await _service.ConvertAsync(request);
            return Ok(result);
        }

        [HttpPost("convert-to-base")]
        public async Task<ActionResult<ConvertCurrencyResponse>> ConvertToBaseCurrency(
            [FromBody] ConvertCurrencyRequest request,
            [FromQuery] int companyId)
        {
            var result = await _service.ConvertToBaseCurrencyAsync(companyId, request.Amount, request.FromCurrencyId, request.AsOfDate);
            return Ok(result);
        }

        [HttpGet("format/{currencyId}/{amount}")]
        public ActionResult<string> FormatAmount(int currencyId, decimal amount)
        {
            var formatted = _service.FormatAmount(amount, currencyId);
            return Ok(formatted);
        }

        #endregion

        #region Company Settings

        [HttpGet("company/{companyId}/settings")]
        public async Task<ActionResult<CompanyCurrencySettingsDto>> GetCompanySettings(int companyId)
        {
            var settings = await _service.GetCompanySettingsAsync(companyId);
            return Ok(settings);
        }

        [HttpPut("company/{companyId}/settings")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<CompanyCurrencySettingsDto>> UpdateCompanySettings(
            int companyId,
            [FromBody] UpdateCompanyCurrencySettingsRequest request)
        {
            var settings = await _service.UpdateCompanySettingsAsync(companyId, request);
            return Ok(settings);
        }

        [HttpPost("company/{companyId}/enable")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<CompanyCurrencySettingsDto>> EnableMultiCurrency(int companyId, [FromQuery] int baseCurrencyId)
        {
            var settings = await _service.EnableMultiCurrencyAsync(companyId, baseCurrencyId);
            return Ok(settings);
        }

        #endregion

        #region Project Budget

        [HttpGet("project/{projectId}/budgets")]
        public async Task<ActionResult<List<ProjectCurrencyBudgetDto>>> GetProjectBudgets(int projectId)
        {
            var budgets = await _service.GetProjectBudgetsAsync(projectId);
            return Ok(budgets);
        }

        [HttpPost("project/budgets")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<ProjectCurrencyBudgetDto>> CreateProjectBudget([FromBody] CreateProjectCurrencyBudgetRequest request)
        {
            var budget = await _service.CreateProjectBudgetAsync(request);
            return Ok(budget);
        }

        [HttpPut("project/budgets/{id}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<ProjectCurrencyBudgetDto>> UpdateProjectBudget(int id, [FromBody] UpdateProjectCurrencyBudgetRequest request)
        {
            var budget = await _service.UpdateProjectBudgetAsync(id, request);
            return Ok(budget);
        }

        [HttpDelete("project/budgets/{id}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult> DeleteProjectBudget(int id)
        {
            await _service.DeleteProjectBudgetAsync(id);
            return NoContent();
        }

        #endregion

        #region Reports

        [HttpGet("company/{companyId}/summary")]
        public async Task<ActionResult<MultiCurrencyReportDto>> GetCurrencySummary(
            int companyId,
            [FromQuery] DateTime? asOfDate)
        {
            var summary = await _service.GetCurrencySummaryAsync(companyId, asOfDate);
            return Ok(summary);
        }

        [HttpGet("company/{companyId}/conversion-logs")]
        public async Task<ActionResult<List<CurrencyConversionLog>>> GetConversionLogs(
            int companyId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? currencyId)
        {
            var logs = await _service.GetConversionLogsAsync(companyId, startDate, endDate, currencyId);
            return Ok(logs);
        }

        #endregion
    }
}

