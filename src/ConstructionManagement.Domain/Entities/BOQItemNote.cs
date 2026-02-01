using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Notes, comments, rejections or observations attached to a specific BOQ item
/// Can come from site engineers, reviewers, managers, etc.
/// Supports linking to related media (photos/videos) when rejection is based on evidence
/// </summary>
public class BOQItemNote : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    // Required – the BOQ item this note belongs to
    public int BOQItemId { get; set; }

    [ForeignKey(nameof(BOQItemId))]
    public virtual BOQItem BOQItem { get; set; } = null!;

    // Optional but very useful for fast project-level filtering / reporting
    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    // -- Note content ----------------------------------------------------------
    public string NoteText { get; set; } = string.Empty;

    // Category / purpose of the note
    public string NoteType { get; set; } = "General";
    // Common values: General, Comment, Rejection, QualityIssue, SafetyConcern, VariationRequest, etc.

    // -- Creator & Visibility --------------------------------------------------
    public int CreatorUserId { get; set; }

    [ForeignKey(nameof(CreatorUserId))]
    public virtual User Creator { get; set; } = null!;

    /// <summary>
    /// Role(s) that can see this note
    /// Currently single value – can be changed to comma-separated or many-to-many later
    /// </summary>
    public string VisibleToRole { get; set; } = "SiteEngineer";

    // -- Optional relation to evidence -----------------------------------------
    public int? RelatedMediaId { get; set; }

    [ForeignKey(nameof(RelatedMediaId))]
    public virtual SiteMedia? RelatedMedia { get; set; }

    // Optional future additions you might consider:
    // public bool IsPinned { get; set; } = false;
    // public int? ReplyToNoteId { get; set; }
    // public virtual BOQItemNote? ReplyTo { get; set; }
    // public virtual ICollection<BOQItemNote> Replies { get; set; } = new List<BOQItemNote>();
}
