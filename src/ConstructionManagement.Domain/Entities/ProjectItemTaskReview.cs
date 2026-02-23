using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Review record for a project item task
/// Tracks all review actions (approval, rejection, revision request) with comments
/// </summary>
public class ProjectItemTaskReview : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    // -- Task Relationship ------------------------------------------------------
    public int ProjectItemTaskId { get; set; }
    
    [ForeignKey(nameof(ProjectItemTaskId))]
    public virtual ProjectItemTask Task { get; set; } = null!;
    
    // -- Review Information -----------------------------------------------------
    /// <summary>
    /// Type of review action
    /// </summary>
    public ReviewType ReviewType { get; set; }
    
    /// <summary>
    /// Status before this review
    /// </summary>
    public Domain.Enums.ProjectTaskStatus PreviousStatus { get; set; }
    
    /// <summary>
    /// Status after this review
    /// </summary>
    public Domain.Enums.ProjectTaskStatus NewStatus { get; set; }
    
    // -- Reviewer --------------------------------------------------------------
    /// <summary>
    /// User who performed the review
    /// </summary>
    public int ReviewerUserId { get; set; }
    
    [ForeignKey(nameof(ReviewerUserId))]
    public virtual User ReviewerUser { get; set; } = null!;
    
    /// <summary>
    /// When the review was performed
    /// </summary>
    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
    
    // -- Comments & Feedback ----------------------------------------------------
    /// <summary>
    /// General comments from the reviewer
    /// </summary>
    public string? Comments { get; set; }
    
    /// <summary>
    /// Specific instructions for revision (if ReviewType = RevisionRequest)
    /// </summary>
    public string? RevisionInstructions { get; set; }
    
    /// <summary>
    /// Reason for rejection (if ReviewType = Rejection)
    /// </summary>
    public string? RejectionReason { get; set; }
    
    // -- Attachment Review ------------------------------------------------------
    /// <summary>
    /// Specific attachment being reviewed (if reviewing a single attachment)
    /// </summary>
    public int? AttachmentId { get; set; }
    
    [ForeignKey(nameof(AttachmentId))]
    public virtual ProjectItemTaskAttachment? Attachment { get; set; }
    
    // -- Quality Assessment -----------------------------------------------------
    /// <summary>
    /// Quality rating (1-5 stars)
    /// </summary>
    public int? QualityRating { get; set; }
    
    /// <summary>
    /// Whether work meets quality standards
    /// </summary>
    public bool? MeetsQualityStandards { get; set; }
    
    /// <summary>
    /// Whether work meets safety standards
    /// </summary>
    public bool? MeetsSafetyStandards { get; set; }
    
    // -- Additional Fields ------------------------------------------------------
    /// <summary>
    /// Whether this review requires follow-up
    /// </summary>
    public bool RequiresFollowUp { get; set; } = false;
    
    /// <summary>
    /// Follow-up date (if requires follow-up)
    /// </summary>
    public DateTime? FollowUpDate { get; set; }
    
    /// <summary>
    /// Whether the review notification was sent
    /// </summary>
    public bool NotificationSent { get; set; } = false;
    
    /// <summary>
    /// When the notification was sent
    /// </summary>
    public DateTime? NotificationSentAt { get; set; }
}
