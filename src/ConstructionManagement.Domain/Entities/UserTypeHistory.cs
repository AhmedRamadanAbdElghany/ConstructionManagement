using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Tracks user type changes over time
/// Used for audit trail and notification routing
/// </summary>
public class UserTypeHistory : BaseEntity
{
    /// <summary>
    /// The user whose type was changed
    /// </summary>
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    /// <summary>
    /// The user type before the change
    /// </summary>
    public UserType PreviousType { get; set; }

    /// <summary>
    /// The new user type after the change
    /// </summary>
    public UserType NewType { get; set; }

    /// <summary>
    /// When the type was changed
    /// </summary>
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Who initiated the change (user ID, or "system" for automated changes)
    /// </summary>
    public string? ChangedBy { get; set; }

    /// <summary>
    /// Optional reason for the type change
    /// </summary>
    public string? Reason { get; set; }
}
