namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Defines the type of invoice for construction project financial tracking.
/// </summary>
public enum InvoiceType
{
    /// <summary>
    /// Disbursement Authorization (اذن صرف) - Records money going out for project expenses
    /// </summary>
    DisbursementAuthorization = 1,
    
    /// <summary>
    /// Purchase Invoice (فاتورة شراء) - Records purchases made for the project
    /// </summary>
    PurchaseInvoice = 2
}

/// <summary>
/// Extension methods for InvoiceType enum
/// </summary>
public static class InvoiceTypeExtensions
{
    /// <summary>
    /// Get display name for the invoice type
    /// </summary>
    public static string GetDisplayName(this InvoiceType type)
    {
        return type switch
        {
            InvoiceType.DisbursementAuthorization => "Disbursement Authorization",
            InvoiceType.PurchaseInvoice => "Purchase Invoice",
            _ => type.ToString()
        };
    }

    /// <summary>
    /// Get Arabic display name for the invoice type
    /// </summary>
    public static string GetArabicDisplayName(this InvoiceType type)
    {
        return type switch
        {
            InvoiceType.DisbursementAuthorization => "اذن صرف",
            InvoiceType.PurchaseInvoice => "فاتورة شراء",
            _ => type.ToString()
        };
    }

    /// <summary>
    /// Convert to database string for storage
    /// </summary>
    public static string ToDatabaseString(this InvoiceType type)
    {
        return type switch
        {
            InvoiceType.DisbursementAuthorization => "DisbursementAuthorization",
            InvoiceType.PurchaseInvoice => "PurchaseInvoice",
            _ => type.ToString()
        };
    }

    /// <summary>
    /// Parse from database string
    /// </summary>
    public static InvoiceType? FromString(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return null;

        return value?.ToLowerInvariant() switch
        {
            "disbursementauthorization" => InvoiceType.DisbursementAuthorization,
            "purchaseinvoice" => InvoiceType.PurchaseInvoice,
            "1" => InvoiceType.DisbursementAuthorization,
            "2" => InvoiceType.PurchaseInvoice,
            _ => null
        };
    }
}
