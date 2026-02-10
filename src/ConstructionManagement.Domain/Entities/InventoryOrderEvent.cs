using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Audit trail events for inventory orders
/// </summary>
public class InventoryOrderEvent : BaseEntity
{
    /// <summary>
    /// Associated order
    /// </summary>
    public int OrderId { get; set; }
    [ForeignKey(nameof(OrderId))]
    public virtual InventoryOrder? Order { get; set; }

    /// <summary>
    /// Event type
    /// </summary>
    public OrderEventType EventType { get; set; }

    /// <summary>
    /// Event description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// User who triggered the event
    /// </summary>
    public int? TriggeredByUserId { get; set; }
    [ForeignKey(nameof(TriggeredByUserId))]
    public virtual User? TriggeredByUser { get; set; }

    /// <summary>
    /// Previous status (for status change events)
    /// </summary>
    public string? PreviousStatus { get; set; }

    /// <summary>
    /// New status (for status change events)
    /// </summary>
    public string? NewStatus { get; set; }

    /// <summary>
    /// Additional event data (JSON)
    /// </summary>
    public string? EventData { get; set; }

    /// <summary>
    /// Event timestamp
    /// </summary>
    public DateTime EventDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Order event types
    /// </summary>
    public enum OrderEventType
    {
        Created = 1,
        StatusChanged = 2,
        ItemAdded = 3,
        ItemRemoved = 4,
        PriceNegotiated = 5,
        PaymentReceived = 6,
        DeliveryStarted = 7,
        DeliveryArrived = 8,
        DeliveryCompleted = 9,
        Cancelled = 10,
        NoteAdded = 11,
        DocumentUploaded = 12
    }
}
