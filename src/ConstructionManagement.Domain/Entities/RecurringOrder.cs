using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents recurring/subscription orders
/// </summary>
public class RecurringOrder : BaseEntity
{
    /// <summary>
    /// Customer/Company Owner
    /// </summary>
    public int CustomerUserId { get; set; }
    [ForeignKey(nameof(CustomerUserId))]
    public virtual User? CustomerUser { get; set; }

    /// <summary>
    /// Supplier/Inventory Owner
    /// </summary>
    public int SupplierUserId { get; set; }
    [ForeignKey(nameof(SupplierUserId))]
    public virtual User? SupplierUser { get; set; }

    /// <summary>
    /// Warehouse source
    /// </summary>
    public int? WarehouseId { get; set; }
    [ForeignKey(nameof(WarehouseId))]
    public virtual InventoryWarehouse? Warehouse { get; set; }

    /// <summary>
    /// Target project
    /// </summary>
    public int? ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }

    /// <summary>
    /// Subscription name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Is subscription active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Frequency
    /// </summary>
    public RecurrenceFrequency Frequency { get; set; }

    /// <summary>
    /// Interval (every 1 week, every 2 weeks, etc.)
    /// </summary>
    public int Interval { get; set; } = 1;

    /// <summary>
    /// Day of week (for Weekly)
    /// </summary>
    public int? DayOfWeek { get; set; }

    /// <summary>
    /// Day of month (for Monthly)
    /// </summary>
    public int? DayOfMonth { get; set; }

    /// <summary>
    /// Next order date
    /// </summary>
    public DateTime NextOrderDate { get; set; }

    /// <summary>
    /// Last order date
    /// </summary>
    public DateTime? LastOrderDate { get; set; }

    /// <summary>
    /// End date (null = never ends)
    /// </summary>
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// Total orders generated
    /// </summary>
    public int TotalOrdersGenerated { get; set; } = 0;

    /// <summary>
    /// Maximum orders (null = unlimited)
    /// </summary>
    public int? MaxOrders { get; set; }

    /// <summary>
    /// Delivery address
    /// </summary>
    public string? DeliveryAddress { get; set; }

    /// <summary>
    /// Delivery notes
    /// </summary>
    public string? DeliveryNotes { get; set; }

    /// <summary>
    /// Estimated total per order
    /// </summary>
    public decimal? EstimatedOrderTotal { get; set; }

    /// <summary>
    /// Cancellation reason
    /// </summary>
    public string? CancellationReason { get; set; }

    /// <summary>
    /// Cancelled date
    /// </summary>
    public DateTime? CancelledDate { get; set; }

    // Navigation Properties
    public virtual ICollection<RecurringOrderItem> Items { get; set; } = new List<RecurringOrderItem>();
    public virtual ICollection<InventoryOrder> GeneratedOrders { get; set; } = new List<InventoryOrder>();

    /// <summary>
    /// Recurrence frequency options
    /// </summary>
    public enum RecurrenceFrequency
    {
        Daily = 1,
        Weekly = 2,
        BiWeekly = 3,
        Monthly = 4,
        Quarterly = 5,
        Yearly = 6
    }
}
