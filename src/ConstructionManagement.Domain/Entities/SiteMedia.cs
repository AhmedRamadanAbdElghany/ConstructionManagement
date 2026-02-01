using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

public class SiteMedia : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    // Primary Key is inherited from BaseEntity ? public int Id { get; set; }

    // Required: every media belongs to a project
    public int ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    // Optional: can be linked to a specific BOQ item
    public int? BOQItemId { get; set; }
    public virtual BOQItem? BOQItem { get; set; }

    // Who uploaded this media
    public int UploaderUserId { get; set; }
    [ForeignKey(nameof(UploaderUserId))]
    public virtual User Uploader { get; set; } = null!;

    // Review / approval workflow
    public int? ReviewerUserId { get; set; }
    [ForeignKey(nameof(ReviewerUserId))]
    public virtual User? Reviewer { get; set; }

    public DateTime? ReviewDate { get; set; }
    public bool IsApproved { get; set; }
    public string Status { get; set; } = "Pending";           // e.g. Pending, Approved, Rejected
    public string? RejectionReason { get; set; }

    // Media information
    public string MediaType { get; set; } = string.Empty;     // e.g. "image/jpeg", "video/mp4", "application/pdf"
    public string FilePath { get; set; } = string.Empty;      // relative or absolute path / URL / key in storage
    public string? Description { get; set; }

    // Origin / context of upload
    public SourceType Source { get; set; }                    // OnlineUpload, PhysicalVisit, ...
    public virtual ICollection<BOQItemNote> RelatedNotes { get; set; }
        = new List<BOQItemNote>();
}
