using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Runtime instance of an approval request (created when something needs approval)
/// Tracks the full lifecycle of an approval process (e.g., photo review, invoice approval, daily log close)
/// </summary>
public class ApprovalRequest : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    public int ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    public int? ProjectItemId { get; set; }
    [ForeignKey(nameof(ProjectItemId))]
    public virtual ProjectItem? ProjectItem { get; set; }

    // The rule/policy that triggered this request
    public int? ProjectApprovalRuleId { get; set; }
    [ForeignKey(nameof(ProjectApprovalRuleId))]
    public virtual ProjectApprovalRule? ApprovalRule { get; set; }

    public SourceType Source { get; set; }
    public int SourceId { get; set; }           // e.g. SiteMedia.Id, ItemDailyLog.Id, ItemInvoice.Id

    public int RequestedByUserId { get; set; }
    [ForeignKey(nameof(RequestedByUserId))]
    public virtual User RequestedBy { get; set; } = null!;

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Pending"; // Pending, InProgress, Approved, Rejected, Escalated
    public DateTime? FinalApprovedAt { get; set; }
    public int? FinalApprovedByUserId { get; set; }
    [ForeignKey(nameof(FinalApprovedByUserId))]
    public virtual User? FinalApprovedBy { get; set; }

    public string? RejectionReason { get; set; }

    // All steps in this approval workflow
    public virtual ICollection<ApprovalStep> Steps { get; set; } = new List<ApprovalStep>();
}
