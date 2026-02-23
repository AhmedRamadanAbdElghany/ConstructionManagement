using System;
using System.Collections.Generic;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Supported currency in the system
    /// </summary>
    public class Currency : BaseEntity
    {
        public string Code { get; set; } = string.Empty; // USD, EUR, EGP, etc.
        public string Name { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty; // $, €, £, etc.
        public int DecimalPlaces { get; set; } = 2;
        public bool IsActive { get; set; } = true;
        public bool IsDefault { get; set; } = false;
        public string? FormatPattern { get; set; } // "{symbol}{amount}" or "{amount} {symbol}"
        
        // Navigation
        public ICollection<ExchangeRate> ExchangeRatesFrom { get; set; } = new List<ExchangeRate>();
        public ICollection<ExchangeRate> ExchangeRatesTo { get; set; } = new List<ExchangeRate>();
    }

    /// <summary>
    /// Exchange rate between currencies
    /// </summary>
    public class ExchangeRate : BaseEntity
    {
        public int FromCurrencyId { get; set; }
        public Currency FromCurrency { get; set; } = null!;

        public int ToCurrencyId { get; set; }
        public Currency ToCurrency { get; set; } = null!;

        public decimal Rate { get; set; }
        public DateTime EffectiveDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? Source { get; set; } // Manual, API, etc.
        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// Company currency settings
    /// </summary>
    public class CompanyCurrencySetting : BaseEntity
    {
        public int CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int BaseCurrencyId { get; set; }
        public Currency BaseCurrency { get; set; } = null!;

        public bool MultiCurrencyEnabled { get; set; } = false;
        public bool AutoUpdateRates { get; set; } = false;
        public int RateUpdateFrequencyHours { get; set; } = 24;
        public string? PreferredRateSource { get; set; }
        public DateTime? LastRateUpdate { get; set; }
        
        // Rounding settings
        public RoundingMethod RoundingMethod { get; set; } = RoundingMethod.Round;
        public int RoundingPrecision { get; set; } = 2;
    }

    /// <summary>
    /// Currency conversion log for audit trail
    /// </summary>
    public class CurrencyConversionLog : BaseEntity
    {
        public int CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int FromCurrencyId { get; set; }
        public Currency FromCurrency { get; set; } = null!;

        public int ToCurrencyId { get; set; }
        public Currency ToCurrency { get; set; } = null!;

        public decimal OriginalAmount { get; set; }
        public decimal ConvertedAmount { get; set; }
        public decimal AppliedRate { get; set; }
        public int? ExchangeRateId { get; set; }
        public ExchangeRate? ExchangeRate { get; set; }

        public string EntityType { get; set; } = string.Empty; // Transaction, Invoice, Payment
        public int EntityId { get; set; }
        public DateTime ConvertedAt { get; set; }
        public int ConvertedByUserId { get; set; }
        public User ConvertedByUser { get; set; } = null!;
    }

    /// <summary>
    /// Multi-currency budget for projects
    /// </summary>
    public class ProjectCurrencyBudget : BaseEntity
    {
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public int CurrencyId { get; set; }
        public Currency Currency { get; set; } = null!;

        public decimal BudgetAmount { get; set; }
        public decimal SpentAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public bool IsPrimary { get; set; } = false;
    }

    #region Enums

    public enum RoundingMethod
    {
        Round = 1,
        Floor = 2,
        Ceiling = 3,
        Truncate = 4
    }

    #endregion
}
