using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

public enum AnnouncementType
{
    General = 0,
    Offer = 1
}

public class CompanyAnnouncement : BaseEntity
{
    public int CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Company Company { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty; 

    public AnnouncementType Type { get; set; } = AnnouncementType.General;

    public string? ImageUrl { get; set; }

    public bool IsPublished { get; set; } = false;
    public DateTime? PublishedAt { get; set; } // Set only when IsPublished becomes true
}
