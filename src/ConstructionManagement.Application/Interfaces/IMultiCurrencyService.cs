using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IMultiCurrencyService
    {
        #region Currency Management

        /// <summary>
        /// Get all active currencies
        /// </summary>
        Task<List<CurrencyDto>> GetCurrenciesAsync();

        /// <summary>
        /// Get currency by ID
        /// </summary>
        Task<CurrencyDto> GetCurrencyAsync(int id);

        /// <summary>
        /// Get currency by code
        /// </summary>
        Task<CurrencyDto?> GetCurrencyByCodeAsync(string code);

        /// <summary>
        /// Create a new currency (SuperAdmin only)
        /// </summary>
        Task<CurrencyDto> CreateCurrencyAsync(CreateCurrencyRequest request);

        /// <summary>
        /// Update a currency (SuperAdmin only)
        /// </summary>
        Task<CurrencyDto> UpdateCurrencyAsync(int id, UpdateCurrencyRequest request);

        /// <summary>
        /// Delete a currency (SuperAdmin only)
        /// </summary>
        Task DeleteCurrencyAsync(int id);

        /// <summary>
        /// Set default currency
        /// </summary>
        Task SetDefaultCurrencyAsync(int id);

        #endregion

        #region Exchange Rates

        /// <summary>
        /// Get exchange rate between two currencies
        /// </summary>
        Task<ExchangeRateDto> GetExchangeRateAsync(int fromCurrencyId, int toCurrencyId, DateTime? asOfDate = null);

        /// <summary>
        /// Get all exchange rates for a currency
        /// </summary>
        Task<List<ExchangeRateDto>> GetExchangeRatesForCurrencyAsync(int currencyId);

        /// <summary>
        /// Get all active exchange rates
        /// </summary>
        Task<List<ExchangeRateDto>> GetAllExchangeRatesAsync();

        /// <summary>
        /// Create or update exchange rate
        /// </summary>
        Task<ExchangeRateDto> SetExchangeRateAsync(CreateExchangeRateRequest request);

        /// <summary>
        /// Bulk update exchange rates
        /// </summary>
        Task<List<ExchangeRateDto>> BulkSetExchangeRatesAsync(BulkExchangeRateRequest request);

        /// <summary>
        /// Update exchange rate
        /// </summary>
        Task<ExchangeRateDto> UpdateExchangeRateAsync(int id, UpdateExchangeRateRequest request);

        /// <summary>
        /// Delete exchange rate
        /// </summary>
        Task DeleteExchangeRateAsync(int id);

        /// <summary>
        /// Get exchange rate history
        /// </summary>
        Task<ExchangeRateHistoryDto> GetExchangeRateHistoryAsync(int fromCurrencyId, int toCurrencyId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Fetch latest rates from external API
        /// </summary>
        Task<List<ExchangeRateDto>> FetchLatestRatesAsync(int baseCurrencyId, string? source = null);

        #endregion

        #region Currency Conversion

        /// <summary>
        /// Convert amount from one currency to another
        /// </summary>
        Task<ConvertCurrencyResponse> ConvertAsync(ConvertCurrencyRequest request);

        /// <summary>
        /// Convert amount to company base currency
        /// </summary>
        Task<ConvertCurrencyResponse> ConvertToBaseCurrencyAsync(int companyId, decimal amount, int fromCurrencyId, DateTime? asOfDate = null);

        /// <summary>
        /// Format amount with currency symbol
        /// </summary>
        string FormatAmount(decimal amount, int currencyId);

        /// <summary>
        /// Format amount with currency code
        /// </summary>
        string FormatAmountWithCode(decimal amount, int currencyId);

        #endregion

        #region Company Currency Settings

        /// <summary>
        /// Get company currency settings
        /// </summary>
        Task<CompanyCurrencySettingsDto> GetCompanySettingsAsync(int companyId);

        /// <summary>
        /// Update company currency settings
        /// </summary>
        Task<CompanyCurrencySettingsDto> UpdateCompanySettingsAsync(int companyId, UpdateCompanyCurrencySettingsRequest request);

        /// <summary>
        /// Enable multi-currency for company
        /// </summary>
        Task<CompanyCurrencySettingsDto> EnableMultiCurrencyAsync(int companyId, int baseCurrencyId);

        #endregion

        #region Project Currency Budget

        /// <summary>
        /// Get project currency budgets
        /// </summary>
        Task<List<ProjectCurrencyBudgetDto>> GetProjectBudgetsAsync(int projectId);

        /// <summary>
        /// Create project currency budget
        /// </summary>
        Task<ProjectCurrencyBudgetDto> CreateProjectBudgetAsync(CreateProjectCurrencyBudgetRequest request);

        /// <summary>
        /// Update project currency budget
        /// </summary>
        Task<ProjectCurrencyBudgetDto> UpdateProjectBudgetAsync(int id, UpdateProjectCurrencyBudgetRequest request);

        /// <summary>
        /// Delete project currency budget
        /// </summary>
        Task DeleteProjectBudgetAsync(int id);

        #endregion

        #region Reports

        /// <summary>
        /// Get multi-currency summary for company
        /// </summary>
        Task<MultiCurrencyReportDto> GetCurrencySummaryAsync(int companyId, DateTime? asOfDate = null);

        /// <summary>
        /// Get conversion logs for audit
        /// </summary>
        Task<List<CurrencyConversionLog>> GetConversionLogsAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null, int? currencyId = null);

        #endregion
    }
}
