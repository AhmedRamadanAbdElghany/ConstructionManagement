using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a request from a user to join a company
/// </summary>
public class JoinRequest : BaseEntity
{
    /// <summary>
    /// The user who wants to join the company
    /// </summary>
    public int? UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    /// <summary>
    /// The company the user wants to join
    /// </summary>
    public int CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company Company { get; set; } = null!;

    /// <summary>
    /// Request status: Pending, Approved, Rejected
    /// </summary>
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// Rejection reason (if rejected)
    /// </summary>
    public string? RejectionReason { get; set; }

    /// <summary>
    /// User who reviewed the request
    /// </summary>
    public int? ReviewedByUserId { get; set; }
    [ForeignKey(nameof(ReviewedByUserId))]
    public virtual User? ReviewedBy { get; set; }

    /// <summary>
    /// When the request was reviewed
    /// </summary>
    public DateTime? ReviewedAt { get; set; }

    /// <summary>
    /// Message from the user explaining why they want to join
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// The role the user is requesting to join as (NormalUser, Worker, InventoryOwner)
    /// </summary>
    public string? RequestedRole { get; set; }
}
