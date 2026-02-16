using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Tracks status changes for warehouse orders
/// </summary>
public class OrderStatusHistory : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// The order this history belongs to
    /// </summary>
    public int OrderId { get; set; }
    [ForeignKey(nameof(OrderId))]
    public virtual WarehouseOrderRequest? Order { get; set; }

    /// <summary>
    /// Previous status
    /// </summary>
    public OrderStatus PreviousStatus { get; set; }

    /// <summary>
    /// New status
    /// </summary>
    public OrderStatus NewStatus { get; set; }

    /// <summary>
    /// User who made the change
    /// </summary>
    public int? ChangedByUserId { get; set; }
    [ForeignKey(nameof(ChangedByUserId))]
    public virtual User? ChangedByUser { get; set; }

    /// <summary>
    /// Notes about the status change
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// When the status was changed
    /// </summary>
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Location when status was changed (for delivery tracking)
    /// </summary>
    public double? Latitude { get; set; }

    /// <summary>
    /// Location when status was changed (for delivery tracking)
    /// </summary>
    public double? Longitude { get; set; }

    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}
