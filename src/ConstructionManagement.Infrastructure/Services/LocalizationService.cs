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
    
    // Default to Arabic
    private string _currentLanguage = "ar";

    public LocalizationService(
        IStringLocalizer<LocalizationService> localizer,
        ILogger<LocalizationService> logger,
        IHttpContextAccessor? httpContextAccessor = null)
    {
        _localizer = localizer;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        
        // Determine language from request context
        DetermineLanguage();
    }

    private void DetermineLanguage()
    {
        try
        {
            // Check HttpContext for Accept-Language header
            if (_httpContextAccessor?.HttpContext != null)
            {
                var acceptLanguage = _httpContextAccessor.HttpContext.Request.Headers["Accept-Language"].FirstOrDefault();
                if (!string.IsNullOrEmpty(acceptLanguage))
                {
                    if (acceptLanguage.StartsWith("en", StringComparison.OrdinalIgnoreCase))
                    {
                        _currentLanguage = "en";
                        return;
                    }
                }
                
                // Check for custom language header
                var langHeader = _httpContextAccessor.HttpContext.Request.Headers["X-Language"].FirstOrDefault();
                if (!string.IsNullOrEmpty(langHeader))
                {
                    if (langHeader.Equals("en", StringComparison.OrdinalIgnoreCase))
                    {
                        _currentLanguage = "en";
                        return;
                    }
                }
                
                // Check query parameter
                var langQuery = _httpContextAccessor.HttpContext.Request.Query["lang"].FirstOrDefault();
                if (!string.IsNullOrEmpty(langQuery))
                {
                    if (langQuery.Equals("en", StringComparison.OrdinalIgnoreCase))
                    {
                        _currentLanguage = "en";
                        return;
                    }
                }
            }
            
            // Default to Arabic
            _currentLanguage = "ar";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error determining language, defaulting to Arabic");
            _currentLanguage = "ar";
        }
    }

    public string this[string key] => GetString(key);

    public string GetString(string key, params object[] args)
    {
        try
        {
            var format = _localizer[key];
            if (string.IsNullOrEmpty(format) || format == key)
            {
                // Return a default Arabic message if key not found
                return GetDefaultArabicMessage(key, args);
            }
            
            return args.Length > 0 ? string.Format(format, args) : format;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error getting localized string for key: {Key}", key);
            return GetDefaultArabicMessage(key, args);
        }
    }

    public string GetNotificationTitle(NotificationType type)
    {
        return type switch
        {
            NotificationType.General => "إشعار جديد",
            NotificationType.ApprovalGranted => "تمت الموافقة",
            NotificationType.ApprovalRejected => "تم الرفض",
            NotificationType.PaymentReceived => "تم استلام الدفعة",
            NotificationType.MilestoneAchieved => "تحقيق مرحلة مهمة",
            NotificationType.ProjectDelay => "تأخر المشروع",
            NotificationType.ItemDelay => "تأخر البند",
            NotificationType.BudgetWarning => "تحذير: اقتراب من الميزانية",
            NotificationType.BudgetOverrun => "تجاوز الميزانية",
            NotificationType.Escalation => "تصعيد",
            _ => "إشعار جديد"
        };
    }

    public string GetNotificationMessage(string templateKey, params object[] args)
    {
        var message = templateKey switch
        {
            // Budget notifications
            "BudgetOverrun" => $"تصعيد حرج: تجاوز الميزانية - البند {args.ElementAtOrDefault(0)} تجاوز الميزانية ({args.ElementAtOrDefault(1)})",
            "BudgetWarning" => $"تحذير: اقتراب من الميزانية - البند {args.ElementAtOrDefault(0)} استهلك 90% من ميزانيته",
            
            // Delay notifications
            "ProjectDelay" => $"تأخر المشروع: {args.ElementAtOrDefault(0)}",
            "ItemDelay" => $"تأخر البند: {args.ElementAtOrDefault(0)}",
            
            // Approval notifications
            "ApprovalNeeded" => $"موافقة مطلوبة على: {args.ElementAtOrDefault(0)}",
            "ApprovalGranted" => $"تمت الموافقة على: {args.ElementAtOrDefault(0)}",
            "ApprovalRejected" => $"تم رفض: {args.ElementAtOrDefault(0)}. السبب: {args.ElementAtOrDefault(1)}",
            
            // Company notifications
            "CompanyApproved" => $"تمت الموافقة على طلب تسجيل شركتك: {args.ElementAtOrDefault(0)}",
            "CompanyRejected" => $"تم رفض طلب تسجيل شركتك. السبب: {args.ElementAtOrDefault(0)}",
            
            // Join request notifications
            "JoinApproved" => $"تمت الموافقة على طلب انضمامك إلى: {args.ElementAtOrDefault(0)}",
            "JoinRejected" => $"تم رفض طلب انضمامك. السبب: {args.ElementAtOrDefault(0)}",
            
            // Payment notifications
            "PaymentReceived" => $"تم استلام دفعة بقيمة {args.ElementAtOrDefault(0)} للمشروع: {args.ElementAtOrDefault(1)}",
            
            // Milestone notifications
            "MilestoneAchieved" => $"تم تحقيق مرحلة مهمة: {args.ElementAtOrDefault(0)} في المشروع: {args.ElementAtOrDefault(1)}",
            
            // Cash voucher notifications
            "CashVoucherPendingApproval" => $"سند صرف قيد الانتظار للموافقة - القيمة: {args.ElementAtOrDefault(0)}",
            
            // Misc expense notifications
            "MiscExpensePendingApproval" => $"مصروف طارئ قيد الانتظار للموافقة - القيمة: {args.ElementAtOrDefault(0)}",
            
            // Default
            _ => args.Length > 0 ? string.Format(templateKey, args) : templateKey
        };
        
        return message;
    }

    public string CurrentLanguage => _currentLanguage;
    
    public bool IsRTL => _currentLanguage == "ar";

    private string GetDefaultArabicMessage(string key, params object[] args)
    {
        // Provide default Arabic messages for common keys
        var defaultMessage = key switch
        {
            // Common messages
            "Success" => "تمت العملية بنجاح",
            "Error" => "حدث خطأ",
            "NotFound" => "غير موجود",
            "Unauthorized" => "غير مصرح",
            "Forbidden" => "محظور",
            "ValidationError" => "خطأ في البيانات",
            
            // Validation messages
            "Validation.Required" => "هذا الحقل مطلوب",
            "Validation.Email" => "البريد الإلكتروني غير صالح",
            "Validation.MinLength" => "يجب أن يكون الحد الأدنى {0} أحرف",
            "Validation.MaxLength" => "يجب ألا يتجاوز {0} حرف",
            "Validation.Range" => "يجب أن تكون القيمة بين {0} و {1}",
            "Validation.Numeric" => "يجب أن يكون رقماً",
            "Validation.MinInterval" => "يجب أن يكون عدد أيام الإشعار أكبر من أو يساوي 1",
            
            // Notification titles
            "Notification.New" => "إشعار جديد",
            "Notification.BudgetOverrun" => "تجاوز الميزانية",
            "Notification.BudgetWarning" => "تحذير: اقتراب من الميزانية",
            "Notification.ProjectDelay" => "تأخر المشروع",
            "Notification.ItemDelay" => "تأخر البند",
            "Notification.ApprovalRequired" => "موافقة مطلوبة",
            "Notification.ApprovalGranted" => "تمت الموافقة",
            "Notification.ApprovalRejected" => "تم الرفض",
            "Notification.PaymentReceived" => "تم استلام الدفعة",
            "Notification.MilestoneAchieved" => "تحقيق مرحلة مهمة",
            "Notification.Escalation" => "تصعيد",
            
            // API messages
            "Api.Success" => "تمت العملية بنجاح",
            "Api.Error" => "حدث خطأ",
            "Api.NotFound" => "غير موجود",
            "Api.Unauthorized" => "غير مصرح",
            "Api.Forbidden" => "محظور",
            "Api.ValidationError" => "خطأ في البيانات",
            
            // Default to the key itself
            _ => key
        };
        
        return args.Length > 0 ? string.Format(defaultMessage, args) : defaultMessage;
    }
}
