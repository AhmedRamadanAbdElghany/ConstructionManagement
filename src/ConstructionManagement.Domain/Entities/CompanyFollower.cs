using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a user who follows a company to receive its announcements.
/// </summary>
public class CompanyFollower : BaseEntity
{
    public int CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Company Company { get; set; } = null!;

    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual User? User { get; set; }

    public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
}
