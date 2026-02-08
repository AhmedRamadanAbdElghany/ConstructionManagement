namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Represents the status of an invoice in the system.
/// </summary>
public enum InvoiceStatus
{
    /// <summary>
    /// Invoice has been created but not yet submitted for review.
    /// </summary>
    Draft = 0,

    /// <summary>
    /// Invoice has been submitted and is awaiting review/approval.
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Invoice has been approved and is awaiting payment.
    /// </summary>
    Approved = 2,

    /// <summary>
    /// Invoice has been rejected by the reviewer.
    /// </summary>
    Rejected = 3,

    /// <summary>
    /// Payment has been received and processed.
    /// </summary>
    Paid = 4,

    /// <summary>
    /// Invoice has been cancelled before payment.
    /// </summary>
    Cancelled = 5,

    /// <summary>
    /// Invoice has been voided (marked as never existed).
    /// </summary>
    Voided = 6,

    /// <summary>
    /// Invoice has been sent to the client.
    /// </summary>
    Sent = 7
}
