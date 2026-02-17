using System.Globalization;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Implementation of localization service for Arabic and English support
/// </summary>
public class LocalizationService : ILocalizationService
{
    private readonly IStringLocalizer<LocalizationService> _localizer;
    private readonly ILogger<LocalizationService> _logger;
    private readonly IHttpContextAccessor? _httpContextAccessor;

    public LocalizationService(
        IStringLocalizer<LocalizationService> localizer,
        ILogger<LocalizationService> logger,
        IHttpContextAccessor? httpContextAccessor = null)
    {
        _localizer = localizer;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// Gets the current language from the request culture (evaluated on each access)
    /// </summary>
    private string GetCurrentLanguage()
    {
        try
        {
            return CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error determining language, defaulting to Arabic");
            return "ar";
        }
    }

    public string this[string key] => GetString(key);

    public string GetString(string key, params object[] args)
    {
        try
        {
            var localized = _localizer[key];
            if (localized.ResourceNotFound && string.IsNullOrEmpty(localized.Value))
            {
                return key;
            }
            
            return args.Length > 0 ? string.Format(localized.Value, args) : localized.Value;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error getting localized string for key: {Key}", key);
            return key;
        }
    }

    public string GetNotificationTitle(NotificationType type)
    {
        var key = $"NotificationTitle.{type}";
        return GetString(key);
    }

    public string GetNotificationMessage(string templateKey, params object[] args)
    {
        var key = $"NotificationMessage.{templateKey}";
        return GetString(key, args);
    }

    public string CurrentLanguage => GetCurrentLanguage();
    
    public bool IsRTL => GetCurrentLanguage() == "ar";
}
