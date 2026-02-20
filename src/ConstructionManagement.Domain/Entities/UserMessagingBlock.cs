using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a user being blocked from messaging a company.
/// Company owners can block users from sending them messages.
/// This is a company-level block that prevents all future conversations.
/// </summary>
public class UserMessagingBlock : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Company? Company { get; set; }
    
    /// <summary>
    /// The user who is blocked
    /// </summary>
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual User User { get; set; } = null!;
    
    /// <summary>
    /// The company admin who blocked this user
    /// </summary>
    public int BlockedByUserId { get; set; }
    [ForeignKey(nameof(BlockedByUserId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual User BlockedByUser { get; set; } = null!;
    
    /// <summary>
    /// Reason for blocking the user
    /// </summary>
    public string? Reason { get; set; }
    
    /// <summary>
    /// When the user was blocked
    /// </summary>
    public DateTime BlockedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// When the block was lifted (if applicable)
    /// </summary>
    public DateTime? UnblockedAt { get; set; }
    
    /// <summary>
    /// Whether this block is currently active
    /// </summary>
    public bool IsActive { get; set; } = true;
}
