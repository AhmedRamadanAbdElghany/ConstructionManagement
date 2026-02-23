using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Attachment (photo/video/document) for a project item task
/// Workers attach photos/videos as proof of work, managers review them
/// </summary>
public class ProjectItemTaskAttachment : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    // -- Task Relationship ------------------------------------------------------
    public int ProjectItemTaskId { get; set; }
    
    [ForeignKey(nameof(ProjectItemTaskId))]
    public virtual ProjectItemTask Task { get; set; } = null!;
    
    // -- File Information -------------------------------------------------------
    /// <summary>
    /// Original file name
    /// </summary>
    public string FileName { get; set; } = string.Empty;
    
    /// <summary>
    /// Stored file path/URL
    /// </summary>
    public string FilePath { get; set; } = string.Empty;
    
    /// <summary>
    /// File size in bytes
    /// </summary>
    public long FileSize { get; set; }
    
    /// <summary>
    /// File content type (MIME type)
    /// </summary>
    public string ContentType { get; set; } = string.Empty;
    
    // -- Media Type -------------------------------------------------------------
    /// <summary>
    /// Type of media (Photo, Video, Document)
    /// </summary>
    public MediaType MediaType { get; set; } = MediaType.Photo;
    
    // -- Thumbnail (for videos/images) ------------------------------------------
    /// <summary>
    /// Thumbnail image path for videos/images
    /// </summary>
    public string? ThumbnailPath { get; set; }
    
    // -- Video-specific fields --------------------------------------------------
    /// <summary>
    /// Video duration in seconds
    /// </summary>
    public int? VideoDurationSeconds { get; set; }
    
    // -- Image-specific fields --------------------------------------------------
    /// <summary>
    /// Image width in pixels
    /// </summary>
    public int? ImageWidth { get; set; }
    
    /// <summary>
    /// Image height in pixels
    /// </summary>
    public int? ImageHeight { get; set; }
    
    // -- Description ------------------------------------------------------------
    /// <summary>
    /// Caption/description for the attachment
    /// </summary>
    public string? Caption { get; set; }
    
    /// <summary>
    /// Description of what the attachment shows
    /// </summary>
    public string? Description { get; set; }
    
    // -- Upload Information -----------------------------------------------------
    /// <summary>
    /// User who uploaded the attachment
    /// </summary>
    public int UploadedByUserId { get; set; }
    
    [ForeignKey(nameof(UploadedByUserId))]
    public virtual User UploadedByUser { get; set; } = null!;
    
    /// <summary>
    /// When the attachment was uploaded
    /// </summary>
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    // -- Review Status ----------------------------------------------------------
    /// <summary>
    /// Current review status of this attachment
    /// </summary>
    public ReviewStatus ReviewStatus { get; set; } = ReviewStatus.Pending;
    
    /// <summary>
    /// User who reviewed this attachment
    /// </summary>
    public int? ReviewedByUserId { get; set; }
    
    [ForeignKey(nameof(ReviewedByUserId))]
    public virtual User? ReviewedByUser { get; set; }
    
    /// <summary>
    /// When the attachment was reviewed
    /// </summary>
    public DateTime? ReviewedAt { get; set; }
    
    /// <summary>
    /// Review comments/feedback
    /// </summary>
    public string? ReviewComments { get; set; }
    
    // -- Location ---------------------------------------------------------------
    /// <summary>
    /// GPS latitude where photo/video was taken
    /// </summary>
    public decimal? Latitude { get; set; }
    
    /// <summary>
    /// GPS longitude where photo/video was taken
    /// </summary>
    public decimal? Longitude { get; set; }
    
    /// <summary>
    /// Location name/address
    /// </summary>
    public string? LocationName { get; set; }
    
    // -- Metadata ---------------------------------------------------------------
    /// <summary>
    /// Additional metadata as JSON
    /// </summary>
    public string? Metadata { get; set; }
    
    /// <summary>
    /// Whether this is a "before" photo (before work started)
    /// </summary>
    public bool IsBeforePhoto { get; set; } = false;
    
    /// <summary>
    /// Whether this is an "after" photo (after work completed)
    /// </summary>
    public bool IsAfterPhoto { get; set; } = false;
    
    /// <summary>
    /// Sort order for display
    /// </summary>
    public int SortOrder { get; set; } = 0;
    
    // -- Navigation Collections -------------------------------------------------
    public virtual ICollection<ProjectItemTaskReview> Reviews { get; set; }
        = new List<ProjectItemTaskReview>();
}
