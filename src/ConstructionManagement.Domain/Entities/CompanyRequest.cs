using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a company creation request submitted by a Company Owner
/// </summary>
public class CompanyRequest : BaseEntity
{
    /// <summary>
    /// The user who submitted the company creation request
    /// </summary>
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// Proposed company name
    /// </summary>
    public string CompanyName { get; set; } = string.Empty;

    /// <summary>
    /// Business/registration ID (optional)
    /// </summary>
    public string? BusinessId { get; set; }

    /// <summary>
    /// Company contact email
    /// </summary>
    public string? ContactEmail { get; set; }

    /// <summary>
    /// Company contact phone
    /// </summary>
    public string? ContactPhone { get; set; }

    /// <summary>
    /// Company address
    /// </summary>
    public string? Address { get; set; }

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
    /// Additional notes or comments
    /// </summary>
    public string? Notes { get; set; }
}
