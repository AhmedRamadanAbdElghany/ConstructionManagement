using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// One step in an approval workflow
/// Supports sequential multi-step approvals (e.g., Site Engineer ? Reviewer ? Manager)
/// </summary>
public class ApprovalStep : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    public int ApprovalRequestId { get; set; }
    [ForeignKey(nameof(ApprovalRequestId))]
    public virtual ApprovalRequest Request { get; set; } = null!;

    public int StepOrder { get; set; }              // 1 = first, 2 = second, etc.

    public string ApproverRole { get; set; } = string.Empty; // e.g. "????? ???"

    public int? ApproverUserId { get; set; }
    [ForeignKey(nameof(ApproverUserId))]
    public virtual User? ApproverUser { get; set; }

    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public bool IsActive { get; set; } = false;     // Is this the current step waiting for action?

    public DateTime? ApprovedAt { get; set; }
    public string? Notes { get; set; }
}
