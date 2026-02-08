namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Extension methods for InvoiceStatus enum operations.
/// </summary>
public static class InvoiceStatusExtensions
{
    /// <summary>
    /// Gets the user-facing description for the invoice status (Arabic).
    /// </summary>
    public static string GetDescription(this InvoiceStatus status)
    {
        return status switch
        {
            InvoiceStatus.Draft => "مسودة",
            InvoiceStatus.Pending => "قيد المراجعة",
            InvoiceStatus.Approved => "موافق عليه",
            InvoiceStatus.Rejected => "مرفوض",
            InvoiceStatus.Paid => "مدفوع",
            InvoiceStatus.Cancelled => "ملغى",
            InvoiceStatus.Voided => "لاغٍ",
            _ => status.ToString()
        };
    }

    /// <summary>
    /// Gets the English description for the invoice status.
    /// </summary>
    public static string GetEnglishDescription(this InvoiceStatus status)
    {
        return status switch
        {
            InvoiceStatus.Draft => "Draft",
            InvoiceStatus.Pending => "Pending Review",
            InvoiceStatus.Approved => "Approved",
            InvoiceStatus.Rejected => "Rejected",
            InvoiceStatus.Paid => "Paid",
            InvoiceStatus.Cancelled => "Cancelled",
            InvoiceStatus.Voided => "Voided",
            _ => status.ToString()
        };
    }

    /// <summary>
    /// Determines if the status is a terminal (final) status.
    /// Once an invoice reaches a terminal status, it cannot be changed.
    /// </summary>
    public static bool IsTerminalStatus(this InvoiceStatus status)
    {
        return status switch
        {
            InvoiceStatus.Paid => true,
            InvoiceStatus.Cancelled => true,
            InvoiceStatus.Voided => true,
            _ => false
        };
    }

    /// <summary>
    /// Determines if the status allows editing of the invoice.
    /// </summary>
    public static bool CanEdit(this InvoiceStatus status)
    {
        return status switch
        {
            InvoiceStatus.Draft => true,
            InvoiceStatus.Rejected => true,
            _ => false
        };
    }

    /// <summary>
    /// Determines if the status allows review actions (approve/reject).
    /// </summary>
    public static bool CanReview(this InvoiceStatus status)
    {
        return status == InvoiceStatus.Pending;
    }

    /// <summary>
    /// Gets the list of allowed next statuses from the current status.
    /// </summary>
    public static IEnumerable<InvoiceStatus> GetAllowedTransitions(this InvoiceStatus current)
    {
        return current switch
        {
            InvoiceStatus.Draft => new[] { InvoiceStatus.Pending, InvoiceStatus.Cancelled },
            InvoiceStatus.Pending => new[] { InvoiceStatus.Approved, InvoiceStatus.Rejected, InvoiceStatus.Draft },
            InvoiceStatus.Approved => new[] { InvoiceStatus.Paid, InvoiceStatus.Cancelled },
            InvoiceStatus.Rejected => new[] { InvoiceStatus.Draft, InvoiceStatus.Cancelled },
            _ => Enumerable.Empty<InvoiceStatus>()
        };
    }

    /// <summary>
    /// Checks if a transition to the target status is valid from the current status.
    /// </summary>
    public static bool CanTransitionTo(this InvoiceStatus current, InvoiceStatus target)
    {
        return GetAllowedTransitions(current).Contains(target);
    }

    /// <summary>
    /// Determines if the invoice can be cancelled based on its current status.
    /// </summary>
    public static bool CanCancel(this InvoiceStatus status)
    {
        // Can cancel if not terminal status and not in pending review
        // Also cannot cancel if already approved
        return !IsTerminalStatus(status) && status != InvoiceStatus.Pending && status != InvoiceStatus.Approved;
    }

    /// <summary>
    /// Converts a string status value to InvoiceStatus enum.
    /// Returns null if the string is not a valid status.
    /// </summary>
    public static InvoiceStatus? FromString(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return null;

        if (Enum.TryParse<InvoiceStatus>(status, true, out var result))
            return result;

        // Handle legacy string values
        return status.ToLowerInvariant() switch
        {
            "pending" => InvoiceStatus.Pending,
            "approved" => InvoiceStatus.Approved,
            "rejected" => InvoiceStatus.Rejected,
            "paid" => InvoiceStatus.Paid,
            "cancelled" or "canceled" => InvoiceStatus.Cancelled,
            "voided" => InvoiceStatus.Voided,
            "draft" => InvoiceStatus.Draft,
            _ => null
        };
    }

    /// <summary>
    /// Converts InvoiceStatus enum to string for database storage.
    /// </summary>
    public static string ToDatabaseString(this InvoiceStatus status)
    {
        return status.ToString();
    }

    /// <summary>
    /// Gets the color code for UI display (Bootstrap colors).
    /// </summary>
    public static string GetColorCode(this InvoiceStatus status)
    {
        return status switch
        {
            InvoiceStatus.Draft => "secondary",
            InvoiceStatus.Pending => "warning",
            InvoiceStatus.Approved => "success",
            InvoiceStatus.Rejected => "danger",
            InvoiceStatus.Paid => "info",
            InvoiceStatus.Cancelled => "dark",
            InvoiceStatus.Voided => "light",
            _ => "primary"
        };
    }

    /// <summary>
    /// Gets the icon class for UI display (Bootstrap Icons).
    /// </summary>
    public static string GetIconClass(this InvoiceStatus status)
    {
        return status switch
        {
            InvoiceStatus.Draft => "bi-file-earmark-text",
            InvoiceStatus.Pending => "bi-clock-history",
            InvoiceStatus.Approved => "bi-check-circle",
            InvoiceStatus.Rejected => "bi-x-circle",
            InvoiceStatus.Paid => "bi-currency-dollar",
            InvoiceStatus.Cancelled => "bi-x-lg",
            InvoiceStatus.Voided => "bi-ban",
            _ => "bi-file-earmark"
        };
    }
}
