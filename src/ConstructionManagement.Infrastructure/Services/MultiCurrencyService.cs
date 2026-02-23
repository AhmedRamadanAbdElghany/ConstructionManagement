using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services
{
    public class MultiCurrencyService : IMultiCurrencyService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<MultiCurrencyService> _logger;

        public MultiCurrencyService(
            ApplicationDbContext context,
            ILogger<MultiCurrencyService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Currency Management

        public async Task<List<CurrencyDto>> GetCurrenciesAsync()
        {
            var currencies = await _context.Currencies
                .Where(c => c.IsActive)
                .OrderBy(c => c.Code)
                .ToListAsync();

            return currencies.Select(MapToDto).ToList();
        }

        public async Task<CurrencyDto> GetCurrencyAsync(int id)
        {
            var currency = await _context.Currencies.FindAsync(id);
            if (currency == null)
                throw new InvalidOperationException($"Currency with ID {id} not found");

            return MapToDto(currency);
        }

        public async Task<CurrencyDto?> GetCurrencyByCodeAsync(string code)
        {
            var currency = await _context.Currencies
                .FirstOrDefaultAsync(c => c.Code.ToUpper() == code.ToUpper() && c.IsActive);

            return currency != null ? MapToDto(currency) : null;
        }

        public async Task<CurrencyDto> CreateCurrencyAsync(CreateCurrencyRequest request)
        {
            var existing = await _context.Currencies
                .AnyAsync(c => c.Code.ToUpper() == request.Code.ToUpper());

            if (existing)
                throw new InvalidOperationException($"Currency with code {request.Code} already exists");

            var currency = new Currency
            {
                Code = request.Code.ToUpper(),
                Name = request.Name,
                Symbol = request.Symbol,
                DecimalPlaces = request.DecimalPlaces,
                IsDefault = request.IsDefault,
                FormatPattern = request.FormatPattern ?? "{symbol}{amount}",
                IsActive = true
            };

            if (request.IsDefault)
            {
                // Unset other defaults
                var otherDefaults = await _context.Currencies.Where(c => c.IsDefault).ToListAsync();
                foreach (var other in otherDefaults)
                {
                    other.IsDefault = false;
                }
            }

            _context.Currencies.Add(currency);
            await _context.SaveChangesAsync();

            return MapToDto(currency);
        }

        public async Task<CurrencyDto> UpdateCurrencyAsync(int id, UpdateCurrencyRequest request)
        {
            var currency = await _context.Currencies.FindAsync(id);
            if (currency == null)
                throw new InvalidOperationException($"Currency with ID {id} not found");

            currency.Name = request.Name;
            currency.Symbol = request.Symbol;
            currency.DecimalPlaces = request.DecimalPlaces;
            currency.IsActive = request.IsActive;
            currency.FormatPattern = request.FormatPattern ?? currency.FormatPattern;

            await _context.SaveChangesAsync();
            return MapToDto(currency);
        }

        public async Task DeleteCurrencyAsync(int id)
        {
            var currency = await _context.Currencies.FindAsync(id);
            if (currency == null)
                throw new InvalidOperationException($"Currency with ID {id} not found");

            currency.IsActive = false;
            await _context.SaveChangesAsync();
        }

        public async Task SetDefaultCurrencyAsync(int id)
        {
            var currency = await _context.Currencies.FindAsync(id);
            if (currency == null)
                throw new InvalidOperationException($"Currency with ID {id} not found");

            var otherDefaults = await _context.Currencies.Where(c => c.IsDefault && c.Id != id).ToListAsync();
            foreach (var other in otherDefaults)
            {
                other.IsDefault = false;
            }

            currency.IsDefault = true;
            currency.IsActive = true;
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Exchange Rates

        public async Task<ExchangeRateDto> GetExchangeRateAsync(int fromCurrencyId, int toCurrencyId, DateTime? asOfDate = null)
        {
            var effectiveDate = asOfDate ?? DateTime.UtcNow;

            var rate = await _context.ExchangeRates
                .Include(r => r.FromCurrency)
                .Include(r => r.ToCurrency)
                .Where(r => r.FromCurrencyId == fromCurrencyId && r.ToCurrencyId == toCurrencyId)
                .Where(r => r.EffectiveDate <= effectiveDate)
                .Where(r => r.IsActive)
                .Where(r => r.ExpiryDate == null || r.ExpiryDate > effectiveDate)
                .OrderByDescending(r => r.EffectiveDate)
                .FirstOrDefaultAsync();

            if (rate == null)
            {
                // Try inverse rate
                var inverseRate = await _context.ExchangeRates
                    .Include(r => r.FromCurrency)
                    .Include(r => r.ToCurrency)
                    .Where(r => r.FromCurrencyId == toCurrencyId && r.ToCurrencyId == fromCurrencyId)
                    .Where(r => r.EffectiveDate <= effectiveDate)
                    .Where(r => r.IsActive)
                    .Where(r => r.ExpiryDate == null || r.ExpiryDate > effectiveDate)
                    .OrderByDescending(r => r.EffectiveDate)
                    .FirstOrDefaultAsync();

                if (inverseRate != null)
                {
                    return new ExchangeRateDto
                    {
                        Id = inverseRate.Id,
                        FromCurrencyId = fromCurrencyId,
                        FromCurrencyCode = inverseRate.ToCurrency.Code,
                        FromCurrencySymbol = inverseRate.ToCurrency.Symbol,
                        ToCurrencyId = toCurrencyId,
                        ToCurrencyCode = inverseRate.FromCurrency.Code,
                        ToCurrencySymbol = inverseRate.FromCurrency.Symbol,
                        Rate = 1 / inverseRate.Rate,
                        EffectiveDate = inverseRate.EffectiveDate,
                        ExpiryDate = inverseRate.ExpiryDate,
                        Source = inverseRate.Source + " (inverted)",
                        IsActive = inverseRate.IsActive
                    };
                }

                throw new InvalidOperationException($"No exchange rate found from currency {fromCurrencyId} to {toCurrencyId}");
            }

            return MapToDto(rate);
        }

        public async Task<List<ExchangeRateDto>> GetExchangeRatesForCurrencyAsync(int currencyId)
        {
            var rates = await _context.ExchangeRates
                .Include(r => r.FromCurrency)
                .Include(r => r.ToCurrency)
                .Where(r => r.FromCurrencyId == currencyId || r.ToCurrencyId == currencyId)
                .Where(r => r.IsActive)
                .OrderByDescending(r => r.EffectiveDate)
                .ToListAsync();

            return rates.Select(MapToDto).ToList();
        }

        public async Task<List<ExchangeRateDto>> GetAllExchangeRatesAsync()
        {
            var rates = await _context.ExchangeRates
                .Include(r => r.FromCurrency)
                .Include(r => r.ToCurrency)
                .Where(r => r.IsActive)
                .OrderByDescending(r => r.EffectiveDate)
                .ToListAsync();

            return rates.Select(MapToDto).ToList();
        }

        public async Task<ExchangeRateDto> SetExchangeRateAsync(CreateExchangeRateRequest request)
        {
            // Expire existing rates
            var existingRates = await _context.ExchangeRates
                .Where(r => r.FromCurrencyId == request.FromCurrencyId && r.ToCurrencyId == request.ToCurrencyId)
                .Where(r => r.IsActive && (r.ExpiryDate == null || r.ExpiryDate > request.EffectiveDate))
                .ToListAsync();

            foreach (var existing in existingRates)
            {
                existing.ExpiryDate = request.EffectiveDate.AddSeconds(-1);
            }

            var rate = new ExchangeRate
            {
                FromCurrencyId = request.FromCurrencyId,
                ToCurrencyId = request.ToCurrencyId,
                Rate = request.Rate,
                EffectiveDate = request.EffectiveDate,
                ExpiryDate = request.ExpiryDate,
                Source = request.Source ?? "Manual",
                IsActive = true
            };

            _context.ExchangeRates.Add(rate);
            await _context.SaveChangesAsync();

            return await GetExchangeRateAsync(rate.Id);
        }

        public async Task<List<ExchangeRateDto>> BulkSetExchangeRatesAsync(BulkExchangeRateRequest request)
        {
            var results = new List<ExchangeRateDto>();

            foreach (var entry in request.Rates)
            {
                var toCurrency = await _context.Currencies
                    .FirstOrDefaultAsync(c => c.Code.ToUpper() == entry.CurrencyCode.ToUpper());

                if (toCurrency == null)
                {
                    _logger.LogWarning("Currency {Code} not found, skipping", entry.CurrencyCode);
                    continue;
                }

                var rateRequest = new CreateExchangeRateRequest
                {
                    FromCurrencyId = request.BaseCurrencyId,
                    ToCurrencyId = toCurrency.Id,
                    Rate = entry.Rate,
                    EffectiveDate = DateTime.UtcNow,
                    Source = "Bulk Import"
                };

                try
                {
                    var result = await SetExchangeRateAsync(rateRequest);
                    results.Add(result);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to set rate for {Code}", entry.CurrencyCode);
                }
            }

            return results;
        }

        public async Task<ExchangeRateDto> UpdateExchangeRateAsync(int id, UpdateExchangeRateRequest request)
        {
            var rate = await _context.ExchangeRates
                .Include(r => r.FromCurrency)
                .Include(r => r.ToCurrency)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rate == null)
                throw new InvalidOperationException($"Exchange rate with ID {id} not found");

            rate.Rate = request.Rate;
            rate.EffectiveDate = request.EffectiveDate;
            rate.ExpiryDate = request.ExpiryDate;
            rate.IsActive = request.IsActive;

            await _context.SaveChangesAsync();
            return MapToDto(rate);
        }

        public async Task DeleteExchangeRateAsync(int id)
        {
            var rate = await _context.ExchangeRates.FindAsync(id);
            if (rate == null)
                throw new InvalidOperationException($"Exchange rate with ID {id} not found");

            rate.IsActive = false;
            await _context.SaveChangesAsync();
        }

        public async Task<ExchangeRateHistoryDto> GetExchangeRateHistoryAsync(int fromCurrencyId, int toCurrencyId, DateTime startDate, DateTime endDate)
        {
            var fromCurrency = await _context.Currencies.FindAsync(fromCurrencyId);
            var toCurrency = await _context.Currencies.FindAsync(toCurrencyId);

            if (fromCurrency == null || toCurrency == null)
                throw new InvalidOperationException("Currency not found");

            var rates = await _context.ExchangeRates
                .Where(r => r.FromCurrencyId == fromCurrencyId && r.ToCurrencyId == toCurrencyId)
                .Where(r => r.EffectiveDate >= startDate && r.EffectiveDate <= endDate)
                .OrderBy(r => r.EffectiveDate)
                .ToListAsync();

            return new ExchangeRateHistoryDto
            {
                FromCurrency = fromCurrency.Code,
                ToCurrency = toCurrency.Code,
                History = rates.Select(r => new RateHistoryEntry
                {
                    Date = r.EffectiveDate,
                    Rate = r.Rate,
                    Source = r.Source
                }).ToList()
            };
        }

        public async Task<List<ExchangeRateDto>> FetchLatestRatesAsync(int baseCurrencyId, string? source = null)
        {
            // This would integrate with external APIs like Open Exchange Rates, Fixer.io, etc.
            // For now, return empty list as this requires API configuration
            _logger.LogInformation("FetchLatestRatesAsync called for base currency {BaseCurrencyId}", baseCurrencyId);
            return new List<ExchangeRateDto>();
        }

        #endregion

        #region Currency Conversion

        public async Task<ConvertCurrencyResponse> ConvertAsync(ConvertCurrencyRequest request)
        {
            var fromCurrency = await _context.Currencies.FindAsync(request.FromCurrencyId);
            var toCurrency = await _context.Currencies.FindAsync(request.ToCurrencyId);

            if (fromCurrency == null || toCurrency == null)
                throw new InvalidOperationException("Currency not found");

            if (request.FromCurrencyId == request.ToCurrencyId)
            {
                return new ConvertCurrencyResponse
                {
                    OriginalAmount = request.Amount,
                    OriginalCurrency = fromCurrency.Code,
                    OriginalCurrencySymbol = fromCurrency.Symbol,
                    ConvertedAmount = request.Amount,
                    TargetCurrency = toCurrency.Code,
                    TargetCurrencySymbol = toCurrency.Symbol,
                    AppliedRate = 1,
                    RateEffectiveDate = DateTime.UtcNow,
                    FormattedOriginal = FormatAmount(request.Amount, fromCurrency),
                    FormattedConverted = FormatAmount(request.Amount, toCurrency)
                };
            }

            var rate = await GetExchangeRateAsync(request.FromCurrencyId, request.ToCurrencyId, request.AsOfDate);
            var convertedAmount = Math.Round(request.Amount * rate.Rate, toCurrency.DecimalPlaces);

            return new ConvertCurrencyResponse
            {
                OriginalAmount = request.Amount,
                OriginalCurrency = fromCurrency.Code,
                OriginalCurrencySymbol = fromCurrency.Symbol,
                ConvertedAmount = convertedAmount,
                TargetCurrency = toCurrency.Code,
                TargetCurrencySymbol = toCurrency.Symbol,
                AppliedRate = rate.Rate,
                RateEffectiveDate = rate.EffectiveDate,
                FormattedOriginal = FormatAmount(request.Amount, fromCurrency),
                FormattedConverted = FormatAmount(convertedAmount, toCurrency)
            };
        }

        public async Task<ConvertCurrencyResponse> ConvertToBaseCurrencyAsync(int companyId, decimal amount, int fromCurrencyId, DateTime? asOfDate = null)
        {
            var settings = await GetCompanySettingsAsync(companyId);
            return await ConvertAsync(new ConvertCurrencyRequest
            {
                Amount = amount,
                FromCurrencyId = fromCurrencyId,
                ToCurrencyId = settings.BaseCurrencyId,
                AsOfDate = asOfDate
            });
        }

        public string FormatAmount(decimal amount, int currencyId)
        {
            var currency = _context.Currencies.Find(currencyId);
            if (currency == null)
                return amount.ToString("N2");

            return FormatAmount(amount, currency);
        }

        public string FormatAmountWithCode(decimal amount, int currencyId)
        {
            var currency = _context.Currencies.Find(currencyId);
            if (currency == null)
                return amount.ToString("N2");

            return $"{FormatAmount(amount, currency)} {currency.Code}";
        }

        #endregion

        #region Company Currency Settings

        public async Task<CompanyCurrencySettingsDto> GetCompanySettingsAsync(int companyId)
        {
            var settings = await _context.CompanyCurrencySettings
                .Include(s => s.BaseCurrency)
                .FirstOrDefaultAsync(s => s.CompanyId == companyId);

            if (settings == null)
            {
                // Create default settings
                var defaultCurrency = await _context.Currencies.FirstOrDefaultAsync(c => c.IsDefault)
                    ?? await _context.Currencies.FirstAsync();

                settings = new CompanyCurrencySetting
                {
                    CompanyId = companyId,
                    BaseCurrencyId = defaultCurrency.Id,
                    MultiCurrencyEnabled = false,
                    AutoUpdateRates = false,
                    RateUpdateFrequencyHours = 24,
                    RoundingMethod = RoundingMethod.Round,
                    RoundingPrecision = 2
                };

                _context.CompanyCurrencySettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            var enabledCurrencies = new List<CurrencyDto> { MapToDto(settings.BaseCurrency) };

            return new CompanyCurrencySettingsDto
            {
                CompanyId = settings.CompanyId,
                BaseCurrencyId = settings.BaseCurrencyId,
                BaseCurrencyCode = settings.BaseCurrency.Code,
                BaseCurrencySymbol = settings.BaseCurrency.Symbol,
                MultiCurrencyEnabled = settings.MultiCurrencyEnabled,
                AutoUpdateRates = settings.AutoUpdateRates,
                RateUpdateFrequencyHours = settings.RateUpdateFrequencyHours,
                PreferredRateSource = settings.PreferredRateSource,
                LastRateUpdate = settings.LastRateUpdate,
                RoundingMethod = settings.RoundingMethod.ToString(),
                RoundingPrecision = settings.RoundingPrecision,
                EnabledCurrencies = enabledCurrencies
            };
        }

        public async Task<CompanyCurrencySettingsDto> UpdateCompanySettingsAsync(int companyId, UpdateCompanyCurrencySettingsRequest request)
        {
            var settings = await _context.CompanyCurrencySettings
                .FirstOrDefaultAsync(s => s.CompanyId == companyId);

            if (settings == null)
            {
                settings = new CompanyCurrencySetting
                {
                    CompanyId = companyId
                };
                _context.CompanyCurrencySettings.Add(settings);
            }

            settings.BaseCurrencyId = request.BaseCurrencyId;
            settings.MultiCurrencyEnabled = request.MultiCurrencyEnabled;
            settings.AutoUpdateRates = request.AutoUpdateRates;
            settings.RateUpdateFrequencyHours = request.RateUpdateFrequencyHours;
            settings.PreferredRateSource = request.PreferredRateSource;
            settings.RoundingMethod = Enum.Parse<RoundingMethod>(request.RoundingMethod);
            settings.RoundingPrecision = request.RoundingPrecision;

            await _context.SaveChangesAsync();

            return await GetCompanySettingsAsync(companyId);
        }

        public async Task<CompanyCurrencySettingsDto> EnableMultiCurrencyAsync(int companyId, int baseCurrencyId)
        {
            return await UpdateCompanySettingsAsync(companyId, new UpdateCompanyCurrencySettingsRequest
            {
                BaseCurrencyId = baseCurrencyId,
                MultiCurrencyEnabled = true,
                AutoUpdateRates = false,
                RateUpdateFrequencyHours = 24,
                RoundingMethod = "Round",
                RoundingPrecision = 2
            });
        }

        #endregion

        #region Project Currency Budget

        public async Task<List<ProjectCurrencyBudgetDto>> GetProjectBudgetsAsync(int projectId)
        {
            var budgets = await _context.ProjectCurrencyBudgets
                .Include(b => b.Currency)
                .Where(b => b.ProjectId == projectId)
                .ToListAsync();

            return budgets.Select(b => new ProjectCurrencyBudgetDto
            {
                Id = b.Id,
                ProjectId = b.ProjectId,
                CurrencyId = b.CurrencyId,
                CurrencyCode = b.Currency.Code,
                CurrencySymbol = b.Currency.Symbol,
                BudgetAmount = b.BudgetAmount,
                SpentAmount = b.SpentAmount,
                RemainingAmount = b.RemainingAmount,
                IsPrimary = b.IsPrimary,
                FormattedBudget = FormatAmount(b.BudgetAmount, b.Currency),
                FormattedSpent = FormatAmount(b.SpentAmount, b.Currency),
                FormattedRemaining = FormatAmount(b.RemainingAmount, b.Currency)
            }).ToList();
        }

        public async Task<ProjectCurrencyBudgetDto> CreateProjectBudgetAsync(CreateProjectCurrencyBudgetRequest request)
        {
            var existing = await _context.ProjectCurrencyBudgets
                .AnyAsync(b => b.ProjectId == request.ProjectId && b.CurrencyId == request.CurrencyId);

            if (existing)
                throw new InvalidOperationException("Budget already exists for this currency");

            if (request.IsPrimary)
            {
                // Unset other primaries
                var otherPrimaries = await _context.ProjectCurrencyBudgets
                    .Where(b => b.ProjectId == request.ProjectId && b.IsPrimary)
                    .ToListAsync();

                foreach (var other in otherPrimaries)
                {
                    other.IsPrimary = false;
                }
            }

            var budget = new ProjectCurrencyBudget
            {
                ProjectId = request.ProjectId,
                CurrencyId = request.CurrencyId,
                BudgetAmount = request.BudgetAmount,
                SpentAmount = 0,
                RemainingAmount = request.BudgetAmount,
                IsPrimary = request.IsPrimary
            };

            _context.ProjectCurrencyBudgets.Add(budget);
            await _context.SaveChangesAsync();

            return (await GetProjectBudgetsAsync(request.ProjectId)).First(b => b.Id == budget.Id);
        }

        public async Task<ProjectCurrencyBudgetDto> UpdateProjectBudgetAsync(int id, UpdateProjectCurrencyBudgetRequest request)
        {
            var budget = await _context.ProjectCurrencyBudgets
                .Include(b => b.Currency)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (budget == null)
                throw new InvalidOperationException($"Budget with ID {id} not found");

            budget.BudgetAmount = request.BudgetAmount;
            budget.RemainingAmount = budget.BudgetAmount - budget.SpentAmount;
            budget.IsPrimary = request.IsPrimary;

            await _context.SaveChangesAsync();

            return new ProjectCurrencyBudgetDto
            {
                Id = budget.Id,
                ProjectId = budget.ProjectId,
                CurrencyId = budget.CurrencyId,
                CurrencyCode = budget.Currency.Code,
                CurrencySymbol = budget.Currency.Symbol,
                BudgetAmount = budget.BudgetAmount,
                SpentAmount = budget.SpentAmount,
                RemainingAmount = budget.RemainingAmount,
                IsPrimary = budget.IsPrimary,
                FormattedBudget = FormatAmount(budget.BudgetAmount, budget.Currency),
                FormattedSpent = FormatAmount(budget.SpentAmount, budget.Currency),
                FormattedRemaining = FormatAmount(budget.RemainingAmount, budget.Currency)
            };
        }

        public async Task DeleteProjectBudgetAsync(int id)
        {
            var budget = await _context.ProjectCurrencyBudgets.FindAsync(id);
            if (budget == null)
                throw new InvalidOperationException($"Budget with ID {id} not found");

            _context.ProjectCurrencyBudgets.Remove(budget);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Reports

        public async Task<MultiCurrencyReportDto> GetCurrencySummaryAsync(int companyId, DateTime? asOfDate = null)
        {
            var settings = await GetCompanySettingsAsync(companyId);
            var reportDate = asOfDate ?? DateTime.UtcNow;

            // This would aggregate transactions by currency
            // For now, return basic structure
            return new MultiCurrencyReportDto
            {
                CompanyId = companyId,
                BaseCurrencyCode = settings.BaseCurrencyCode,
                ReportDate = reportDate,
                CurrencySummaries = new List<CurrencySummaryDto>(),
                GrandTotalInBaseCurrency = 0,
                FormattedGrandTotal = FormatAmount(0, settings.BaseCurrencyId)
            };
        }

        public async Task<List<CurrencyConversionLog>> GetConversionLogsAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null, int? currencyId = null)
        {
            var query = _context.CurrencyConversionLogs
                .Include(l => l.FromCurrency)
                .Include(l => l.ToCurrency)
                .Include(l => l.ConvertedByUser)
                .Where(l => l.CompanyId == companyId)
                .AsQueryable();

            if (startDate.HasValue)
                query = query.Where(l => l.ConvertedAt >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(l => l.ConvertedAt <= endDate.Value);
            if (currencyId.HasValue)
                query = query.Where(l => l.FromCurrencyId == currencyId.Value || l.ToCurrencyId == currencyId.Value);

            return await query.OrderByDescending(l => l.ConvertedAt).Take(1000).ToListAsync();
        }

        #endregion

        #region Private Helpers

        private static CurrencyDto MapToDto(Currency c) => new()
        {
            Id = c.Id,
            Code = c.Code,
            Name = c.Name,
            Symbol = c.Symbol,
            DecimalPlaces = c.DecimalPlaces,
            IsActive = c.IsActive,
            IsDefault = c.IsDefault,
            FormatPattern = c.FormatPattern
        };

        private static ExchangeRateDto MapToDto(ExchangeRate r) => new()
        {
            Id = r.Id,
            FromCurrencyId = r.FromCurrencyId,
            FromCurrencyCode = r.FromCurrency?.Code ?? string.Empty,
            FromCurrencySymbol = r.FromCurrency?.Symbol ?? string.Empty,
            ToCurrencyId = r.ToCurrencyId,
            ToCurrencyCode = r.ToCurrency?.Code ?? string.Empty,
            ToCurrencySymbol = r.ToCurrency?.Symbol ?? string.Empty,
            Rate = r.Rate,
            EffectiveDate = r.EffectiveDate,
            ExpiryDate = r.ExpiryDate,
            Source = r.Source,
            IsActive = r.IsActive
        };

        private string FormatAmount(decimal amount, Currency currency)
        {
            var formatted = amount.ToString($"N{currency.DecimalPlaces}");
            var pattern = currency.FormatPattern ?? "{symbol}{amount}";
            return pattern.Replace("{symbol}", currency.Symbol).Replace("{amount}", formatted);
        }

        private async Task<ExchangeRateDto> GetExchangeRateAsync(int rateId)
        {
            var rate = await _context.ExchangeRates
                .Include(r => r.FromCurrency)
                .Include(r => r.ToCurrency)
                .FirstAsync(r => r.Id == rateId);

            return MapToDto(rate);
        }

        #endregion
    }
}
