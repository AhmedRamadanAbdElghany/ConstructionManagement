using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a warehouse owned by an Inventory Owner
/// </summary>
public class InventoryWarehouse : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Owner user ID (Inventory Owner)
    /// </summary>
    public int OwnerUserId { get; set; }
    [ForeignKey(nameof(OwnerUserId))]
    public virtual User? OwnerUser { get; set; }

    /// <summary>
    /// Warehouse name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Physical location/address
    /// </summary>
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Optional description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Storage capacity (optional)
    /// </summary>
    public decimal? Capacity { get; set; }

    /// <summary>
    /// Is warehouse active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Is warehouse approved by admin
    /// </summary>
    public bool IsApproved { get; set; } = false;

    /// <summary>
    /// Is warehouse publicly visible on preview page (default true)
    /// </summary>
    public bool IsPubliclyVisible { get; set; } = true;

    /// <summary>
    /// Contact phone
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// Contact email
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Location latitude for map display
    /// </summary>
    public double? Latitude { get; set; }

    /// <summary>
    /// Location longitude for map display
    /// </summary>
    public double? Longitude { get; set; }

    /// <summary>
    /// Associated company (optional - for B2B)
    /// </summary>
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }

    // Navigation Properties
    public virtual ICollection<InventoryStock> Stocks { get; set; } = new List<InventoryStock>();
    public virtual ICollection<InventoryOrder> ReceivedOrders { get; set; } = new List<InventoryOrder>();
    public virtual ICollection<VendorReview> ReceivedReviews { get; set; } = new List<VendorReview>();
    public virtual ICollection<WarehouseOrderRequest> OrderRequests { get; set; } = new List<WarehouseOrderRequest>();
}
