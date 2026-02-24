using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a request from a user to join a warehouse/company
/// </summary>
public class WarehouseJoinRequest : BaseEntity
{
    /// <summary>
    /// The user who requested to join
    /// </summary>
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// The company/warehouse to join
    /// </summary>
    public int CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company Company { get; set; } = null!;

    /// <summary>
    /// Request status: Pending, Approved, Rejected
    /// </summary>
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// The role assigned to the user upon approval
    /// </summary>
    public int? RoleId { get; set; }
    [ForeignKey(nameof(RoleId))]
    public virtual Role? Role { get; set; }

    /// <summary>
    /// Optional message from the user
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// Rejection reason if rejected
    /// </summary>
    public string? RejectionReason { get; set; }

    /// <summary>
    /// User who reviewed the request (company owner/admin)
    /// </summary>
    public int? ReviewedByUserId { get; set; }
    [ForeignKey(nameof(ReviewedByUserId))]
    public virtual User? ReviewedByUser { get; set; }

    /// <summary>
    /// When the request was reviewed
    /// </summary>
    public DateTime? ReviewedAt { get; set; }


}
