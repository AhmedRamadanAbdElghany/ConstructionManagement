using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Payment history records for inventory orders
/// </summary>
public class PaymentHistory : BaseEntity
{
    /// <summary>
    /// Associated order
    /// </summary>
    public int OrderId { get; set; }
    [ForeignKey(nameof(OrderId))]
    public virtual InventoryOrder? Order { get; set; }

    /// <summary>
    /// Payment amount
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Payment method (Cash, BankTransfer, Cheque, etc.)
    /// </summary>
    public string PaymentMethod { get; set; } = string.Empty;

    /// <summary>
    /// Payment reference number
    /// </summary>
    public string? ReferenceNumber { get; set; }

    /// <summary>
    /// Payment notes
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Payment date
    /// </summary>
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Recorded by user
    /// </summary>
    public int? RecordedByUserId { get; set; }
    [ForeignKey(nameof(RecordedByUserId))]
    public virtual User? RecordedByUser { get; set; }

    /// <summary>
    /// Is this a partial payment
    /// </summary>
    public bool IsPartialPayment { get; set; } = false;
}
