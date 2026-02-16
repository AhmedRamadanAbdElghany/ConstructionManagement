using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a review/rating given by a vendor/customer for a warehouse or service provider
/// </summary>
public class VendorReview : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// The warehouse or user being reviewed
    /// </summary>
    public int? RatedUserId { get; set; }
    [ForeignKey(nameof(RatedUserId))]
    public virtual User? RatedUser { get; set; }

    /// <summary>
    /// The warehouse being reviewed (for backward compatibility)
    /// </summary>
    public int? WarehouseId { get; set; }
    [ForeignKey(nameof(WarehouseId))]
    public virtual InventoryWarehouse? Warehouse { get; set; }

    /// <summary>
    /// Reviewer user ID (vendor or customer)
    /// </summary>
    public int ReviewerUserId { get; set; }
    [ForeignKey(nameof(ReviewerUserId))]
    public virtual User? ReviewerUser { get; set; }

    /// <summary>
    /// Related project ID (optional)
    /// </summary>
    public int? ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }

    /// <summary>
    /// Rating (1-5 stars)
    /// </summary>
    public int Rating { get; set; }

    /// <summary>
    /// Optional review comment
    /// </summary>
    public string? Comment { get; set; }

    /// <summary>
    /// Review title (optional)
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Response/reply from the reviewed user
    /// </summary>
    public string? Reply { get; set; }

    /// <summary>
    /// Date of reply
    /// </summary>
    public DateTime? ReplyDate { get; set; }

    /// <summary>
    /// Is the review verified (e.g., verified purchase)
    /// </summary>
    public bool IsVerified { get; set; } = false;

    /// <summary>
    /// Is the review visible publicly
    /// </summary>
    public bool IsPublic { get; set; } = true;

    /// <summary>
    /// Is the review approved by admin
    /// </summary>
    public bool IsApproved { get; set; } = false;

    /// <summary>
    /// Date of the review
    /// </summary>
    public DateTime ReviewDate { get; set; } = DateTime.UtcNow;

    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}
