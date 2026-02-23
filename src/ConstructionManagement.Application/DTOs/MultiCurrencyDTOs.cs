using System;
using System.Collections.Generic;

namespace ConstructionManagement.Application.DTOs
{
    #region Currency DTOs

    public class CurrencyDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty;
        public int DecimalPlaces { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public string? FormatPattern { get; set; }
    }

    public class CreateCurrencyRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty;
        public int DecimalPlaces { get; set; } = 2;
        public bool IsDefault { get; set; }
        public string? FormatPattern { get; set; }
    }

    public class UpdateCurrencyRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty;
        public int DecimalPlaces { get; set; }
        public bool IsActive { get; set; }
        public string? FormatPattern { get; set; }
    }

    #endregion

    #region Exchange Rate DTOs

    public class ExchangeRateDto
    {
        public int Id { get; set; }
        public int FromCurrencyId { get; set; }
        public string FromCurrencyCode { get; set; } = string.Empty;
        public string FromCurrencySymbol { get; set; } = string.Empty;
        public int ToCurrencyId { get; set; }
        public string ToCurrencyCode { get; set; } = string.Empty;
        public string ToCurrencySymbol { get; set; } = string.Empty;
        public decimal Rate { get; set; }
        public DateTime EffectiveDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? Source { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateExchangeRateRequest
    {
        public int FromCurrencyId { get; set; }
        public int ToCurrencyId { get; set; }
        public decimal Rate { get; set; }
        public DateTime EffectiveDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? Source { get; set; }
    }

    public class UpdateExchangeRateRequest
    {
        public decimal Rate { get; set; }
        public DateTime EffectiveDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool IsActive { get; set; }
    }

    public class BulkExchangeRateRequest
    {
        public int BaseCurrencyId { get; set; }
        public List<ExchangeRateEntry> Rates { get; set; } = new();
    }

    public class ExchangeRateEntry
    {
        public string CurrencyCode { get; set; } = string.Empty;
        public decimal Rate { get; set; }
    }

    #endregion

    #region Currency Conversion DTOs

    public class ConvertCurrencyRequest
    {
        public decimal Amount { get; set; }
        public int FromCurrencyId { get; set; }
        public int ToCurrencyId { get; set; }
        public DateTime? AsOfDate { get; set; }
    }

    public class ConvertCurrencyResponse
    {
        public decimal OriginalAmount { get; set; }
        public string OriginalCurrency { get; set; } = string.Empty;
        public string OriginalCurrencySymbol { get; set; } = string.Empty;
        public decimal ConvertedAmount { get; set; }
        public string TargetCurrency { get; set; } = string.Empty;
        public string TargetCurrencySymbol { get; set; } = string.Empty;
        public decimal AppliedRate { get; set; }
        public DateTime RateEffectiveDate { get; set; }
        public string FormattedOriginal { get; set; } = string.Empty;
        public string FormattedConverted { get; set; } = string.Empty;
    }

    public class MultiCurrencyAmountDto
    {
        public decimal Amount { get; set; }
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; } = string.Empty;
        public string CurrencySymbol { get; set; } = string.Empty;
        public decimal? BaseCurrencyAmount { get; set; }
        public string? BaseCurrencyCode { get; set; }
        public decimal? AppliedRate { get; set; }
        public string Formatted { get; set; } = string.Empty;
        public string? FormattedInBaseCurrency { get; set; }
    }

    #endregion

    #region Company Currency Settings DTOs

    public class CompanyCurrencySettingsDto
    {
        public int CompanyId { get; set; }
        public int BaseCurrencyId { get; set; }
        public string BaseCurrencyCode { get; set; } = string.Empty;
        public string BaseCurrencySymbol { get; set; } = string.Empty;
        public bool MultiCurrencyEnabled { get; set; }
        public bool AutoUpdateRates { get; set; }
        public int RateUpdateFrequencyHours { get; set; }
        public string? PreferredRateSource { get; set; }
        public DateTime? LastRateUpdate { get; set; }
        public string RoundingMethod { get; set; } = "Round";
        public int RoundingPrecision { get; set; }
        public List<CurrencyDto> EnabledCurrencies { get; set; } = new();
    }

    public class UpdateCompanyCurrencySettingsRequest
    {
        public int BaseCurrencyId { get; set; }
        public bool MultiCurrencyEnabled { get; set; }
        public bool AutoUpdateRates { get; set; }
        public int RateUpdateFrequencyHours { get; set; }
        public string? PreferredRateSource { get; set; }
        public string RoundingMethod { get; set; } = "Round";
        public int RoundingPrecision { get; set; }
        public List<int> EnabledCurrencyIds { get; set; } = new();
    }

    #endregion

    #region Project Currency Budget DTOs

    public class ProjectCurrencyBudgetDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; } = string.Empty;
        public string CurrencySymbol { get; set; } = string.Empty;
        public decimal BudgetAmount { get; set; }
        public decimal SpentAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public bool IsPrimary { get; set; }
        public string FormattedBudget { get; set; } = string.Empty;
        public string FormattedSpent { get; set; } = string.Empty;
        public string FormattedRemaining { get; set; } = string.Empty;
    }

    public class CreateProjectCurrencyBudgetRequest
    {
        public int ProjectId { get; set; }
        public int CurrencyId { get; set; }
        public decimal BudgetAmount { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class UpdateProjectCurrencyBudgetRequest
    {
        public decimal BudgetAmount { get; set; }
        public bool IsPrimary { get; set; }
    }

    #endregion

    #region Currency Report DTOs

    public class CurrencySummaryDto
    {
        public string CurrencyCode { get; set; } = string.Empty;
        public string CurrencySymbol { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal TotalInBaseCurrency { get; set; }
        public decimal CurrentRate { get; set; }
        public int TransactionCount { get; set; }
        public string FormattedTotal { get; set; } = string.Empty;
        public string FormattedTotalInBaseCurrency { get; set; } = string.Empty;
    }

    public class MultiCurrencyReportDto
    {
        public int CompanyId { get; set; }
        public string BaseCurrencyCode { get; set; } = string.Empty;
        public DateTime ReportDate { get; set; }
        public List<CurrencySummaryDto> CurrencySummaries { get; set; } = new();
        public decimal GrandTotalInBaseCurrency { get; set; }
        public string FormattedGrandTotal { get; set; } = string.Empty;
    }

    public class ExchangeRateHistoryDto
    {
        public string FromCurrency { get; set; } = string.Empty;
        public string ToCurrency { get; set; } = string.Empty;
        public List<RateHistoryEntry> History { get; set; } = new();
    }

    public class RateHistoryEntry
    {
        public DateTime Date { get; set; }
        public decimal Rate { get; set; }
        public string? Source { get; set; }
    }

    #endregion
}
