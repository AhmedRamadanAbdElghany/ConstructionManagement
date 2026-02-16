using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service for localizing messages and notifications in Arabic and English
/// </summary>
public interface ILocalizationService
{
    /// <summary>
    /// Get a localized string by key
    /// </summary>
    string this[string key] { get; }
    
    /// <summary>
    /// Get a localized string with format arguments
    /// </summary>
    string GetString(string key, params object[] args);
    
    /// <summary>
    /// Get a localized notification title based on notification type
    /// </summary>
    string GetNotificationTitle(NotificationType type);
    
    /// <summary>
    /// Get a localized notification message template
    /// </summary>
    string GetNotificationMessage(string templateKey, params object[] args);
    
    /// <summary>
    /// Get the current language code (ar or en)
    /// </summary>
    string CurrentLanguage { get; }
    
    /// <summary>
    /// Check if current language is RTL
    /// </summary>
    bool IsRTL { get; }
}
