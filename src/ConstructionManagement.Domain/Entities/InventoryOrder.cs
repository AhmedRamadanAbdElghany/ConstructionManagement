using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents an order from Company Owner to Inventory Owner
/// </summary>
public class InventoryOrder : BaseEntity
{
    /// <summary>
    /// Unique order number
    /// </summary>
    public string OrderNumber { get; set; } = string.Empty;

    /// <summary>
    /// Order status
    /// </summary>
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    /// <summary>
    /// Payment status
    /// </summary>
    public Enums.PaymentStatus PaymentStatus { get; set; } = Enums.PaymentStatus.Pending;

    /// <summary>
    /// Linked recurring order (if this is an auto-generated order)
    /// </summary>
    public int? RecurringOrderId { get; set; }
    [ForeignKey(nameof(RecurringOrderId))]
    public virtual RecurringOrder? RecurringOrder { get; set; }

    // Dates
    /// <summary>
    /// Order creation date
    /// </summary>
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;



    /// <summary>
    /// Expected delivery date
    /// </summary>
    public DateTime? ExpectedDeliveryDate { get; set; }

    /// <summary>
    /// Actual delivery date
    /// </summary>
    public DateTime? ActualDeliveryDate { get; set; }

    /// <summary>
    /// Delivered at timestamp (for marketplace orders)
    /// </summary>
    public DateTime? DeliveredAt { get; set; }

    /// <summary>
    /// Payment due date
    /// </summary>
    public DateTime? PaymentDueDate { get; set; }

    // Financial
    /// <summary>
    /// Subtotal before discounts
    /// </summary>
    public decimal SubTotal { get; set; }

    /// <summary>
    /// Delivery fee
    /// </summary>
    public decimal DeliveryFee { get; set; }

    /// <summary>
    /// Overall discount percentage
    /// </summary>
    public decimal? DiscountPercent { get; set; }

    /// <summary>
    /// Overall discount amount
    /// </summary>
    public decimal? DiscountAmount { get; set; }

    /// <summary>
    /// Tax amount
    /// </summary>
    public decimal? Tax { get; set; }

    /// <summary>
    /// Total order amount
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Subtotal (alias for marketplace orders)
    /// </summary>
    [NotMapped]
    public decimal Subtotal { get => SubTotal; set => SubTotal = value; }

    /// <summary>
    /// Total (alias for marketplace orders)
    /// </summary>
    [NotMapped]
    public decimal Total { get => TotalAmount; set => TotalAmount = value; }

    /// <summary>
    /// Amount paid so far
    /// </summary>
    public decimal PaidAmount { get; set; } = 0;

    // Discount Applied
    /// <summary>
    /// Applied promo code
    /// </summary>
    public string? AppliedDiscountCode { get; set; }

    /// <summary>
    /// Bulk quantity discount amount
    /// </summary>
    public decimal? BulkDiscountAmount { get; set; }

    /// <summary>
    /// Loyalty discount amount
    /// </summary>
    public decimal? LoyaltyDiscountAmount { get; set; }

    /// <summary>
    /// Promo code discount amount
    /// </summary>
    public decimal? PromoDiscountAmount { get; set; }

    /// <summary>
    /// Order notes
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Payment method: Cash, PayMob, Fawry, VodafoneCash, OrangeMoney, EtisalatCash, Card
    /// </summary>
    public string? PaymentMethod { get; set; }

    /// <summary>
    /// External payment reference (from PayMob, Fawry, etc.)
    /// </summary>
    public string? PaymentReference { get; set; }

    /// <summary>
    /// Payment gateway transaction ID
    /// </summary>
    public string? PaymentGatewayTransactionId { get; set; }

    // Relationships
    /// <summary>
    /// Company Owner (buyer)
    /// </summary>
    public int? CompanyOwnerUserId { get; set; }
    [ForeignKey(nameof(CompanyOwnerUserId))]
    public virtual User? CompanyOwnerUser { get; set; }

    /// <summary>
    /// Inventory Owner (seller)
    /// </summary>
    public int? InventoryOwnerUserId { get; set; }
    [ForeignKey(nameof(InventoryOwnerUserId))]
    public virtual User? InventoryOwnerUser { get; set; }

    /// <summary>
    /// Customer ID (for marketplace orders)
    /// </summary>
    public int CustomerId { get; set; }
    [ForeignKey(nameof(CustomerId))]
    public virtual User? Customer { get; set; }

    /// <summary>
    /// Vendor ID (for marketplace orders)
    /// </summary>
    public int VendorId { get; set; }
    [ForeignKey(nameof(VendorId))]
    public virtual Vendor? Vendor { get; set; }

    /// <summary>
    /// Source warehouse
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

    // Delivery Info
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
    /// Delivery notes
    /// </summary>
    public string? DeliveryNotes { get; set; }

    /// <summary>
    /// Driver name
    /// </summary>
    public string? DriverName { get; set; }

    /// <summary>
    /// Driver phone
    /// </summary>
    public string? DriverPhone { get; set; }

    /// <summary>
    /// Vehicle number
    /// </summary>
    public string? VehicleNumber { get; set; }

    // Navigation Properties
    public virtual ICollection<InventoryOrderItem> Items { get; set; } = new List<InventoryOrderItem>();
    public virtual ICollection<InventoryOrderEvent> Events { get; set; } = new List<InventoryOrderEvent>();
    public virtual ICollection<PaymentHistory> PaymentHistory { get; set; } = new List<PaymentHistory>();

    /// <summary>
    /// Order status values
    /// </summary>
    public enum OrderStatus
    {
        Draft = 0,
        Pending = 1,
        Negotiating = 2,
        Accepted = 3,
        Rejected = 4,
        InPreparation = 5,
        OutForDelivery = 6,
        ArrivedAtSite = 7,
        Unloaded = 8,
        Delivered = 9,
        Cancelled = 10,
        Confirmed = 11,
        Processing = 12,
        Shipped = 13
    }
}
