namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Represents the status of a payment.
/// </summary>
public enum PaymentStatus
{
    /// <summary>
    /// Payment is pending.
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Payment has been approved.
    /// </summary>
    Approved = 1,

    /// <summary>
    /// Payment has been sent/processed.
    /// </summary>
    Sent = 2,

    /// <summary>
    /// Payment has been completed.
    /// </summary>
    Completed = 3,

    /// <summary>
    /// Payment has failed.
    /// </summary>
    Failed = 4,

    /// <summary>
    /// Payment has been cancelled.
    /// </summary>
    Cancelled = 5,

    /// <summary>
    /// Payment has been rejected.
    /// </summary>
    Rejected = 6,

    /// <summary>
    /// Payment has been paid.
    /// </summary>
    Paid = 7,

    /// <summary>
    /// Payment has been refunded.
    /// </summary>
    Refunded = 8
}
