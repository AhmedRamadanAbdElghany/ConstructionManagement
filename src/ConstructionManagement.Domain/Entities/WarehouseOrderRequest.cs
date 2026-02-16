using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Order request from warehouse owner to project
/// </summary>
public class WarehouseOrderRequest : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Unique order number
    /// </summary>
    public string OrderNumber { get; set; } = string.Empty;

    /// <summary>
    /// Unique barcode for tracking
    /// </summary>
    public string Barcode { get; set; } = string.Empty;

    /// <summary>
    /// The warehouse making the request
    /// </summary>
    public int WarehouseId { get; set; }
    [ForeignKey(nameof(WarehouseId))]
    public virtual InventoryWarehouse? Warehouse { get; set; }

    /// <summary>
    /// The warehouse owner user
    /// </summary>
    public int? WarehouseOwnerId { get; set; }
    [ForeignKey(nameof(WarehouseOwnerId))]
    public virtual User? WarehouseOwner { get; set; }

    /// <summary>
    /// The target project
    /// </summary>
    public int? ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }

    /// <summary>
    /// User from warehouse who made the request
    /// </summary>
    public int? RequestedByUserId { get; set; }
    [ForeignKey(nameof(RequestedByUserId))]
    public virtual User? RequestedByUser { get; set; }

    /// <summary>
    /// User from project who received/handled the request
    /// </summary>
    public int? ReceivedByUserId { get; set; }
    [ForeignKey(nameof(ReceivedByUserId))]
    public virtual User? ReceivedByUser { get; set; }

    /// <summary>
    /// Request date
    /// </summary>
    public DateTime RequestDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Request type (Materials, Equipment, Consultation, Quote, etc.)
    /// </summary>
    public string RequestType { get; set; } = string.Empty;

    /// <summary>
    /// Request description/details
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Requested quantity (if applicable)
    /// </summary>
    public decimal? Quantity { get; set; }

    /// <summary>
    /// Unit of measurement
    /// </summary>
    public string? Unit { get; set; }

    /// <summary>
    /// Expected delivery date
    /// </summary>
    public DateTime? ExpectedDeliveryDate { get; set; }

    /// <summary>
    /// Order status
    /// </summary>
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    /// <summary>
    /// Priority (Low, Medium, High, Urgent)
    /// </summary>
    public string Priority { get; set; } = "Medium";

    /// <summary>
    /// Admin/PM response notes
    /// </summary>
    public string? ResponseNotes { get; set; }

    /// <summary>
    /// Response date
    /// </summary>
    public DateTime? ResponseDate { get; set; }

    /// <summary>
    /// Is order fulfilled
    /// </summary>
    public bool IsFulfilled { get; set; } = false;

    /// <summary>
    /// Fulfillment date
    /// </summary>
    public DateTime? FulfillmentDate { get; set; }

    /// <summary>
    /// Order reference number (if accepted)
    /// </summary>
    public string? OrderReferenceNumber { get; set; }

    /// <summary>
    /// Total amount agreed
    /// </summary>
    public decimal? TotalAmount { get; set; }

    /// <summary>
    /// Attached files/documents
    /// </summary>
    public string? AttachmentUrl { get; set; }

    /// <summary>
    /// Delivery address
    /// </summary>
    public string? DeliveryAddress { get; set; }

    /// <summary>
    /// Delivery latitude
    /// </summary>
    public double? DeliveryLatitude { get; set; }

    /// <summary>
    /// Delivery longitude
    /// </summary>
    public double? DeliveryLongitude { get; set; }

    /// <summary>
    /// Actual delivery date
    /// </summary>
    public DateTime? DeliveredAt { get; set; }

    /// <summary>
    /// Order items
    /// </summary>
    public virtual ICollection<WarehouseOrderItem> Items { get; set; } = new List<WarehouseOrderItem>();

    /// <summary>
    /// Status history
    /// </summary>
    public virtual ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();

    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}

/// <summary>
/// Order status enum
/// </summary>
public enum OrderStatus
{
    /// <summary>
    /// Pending - Order is waiting for confirmation
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Confirmed - Order has been confirmed by the warehouse
    /// </summary>
    Confirmed = 1,

    /// <summary>
    /// Preparing - Order is being prepared
    /// </summary>
    Preparing = 2,

    /// <summary>
    /// OutForDelivery - Order is out for delivery
    /// </summary>
    OutForDelivery = 3,

    /// <summary>
    /// Delivered - Order has been delivered
    /// </summary>
    Delivered = 4,

    /// <summary>
    /// Cancelled - Order has been cancelled
    /// </summary>
    Cancelled = 5
}
