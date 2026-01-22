using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// In-app notification sent to a specific user
/// Used for alerts about delays, approvals, budget issues, escalations, etc.
/// </summary>
public class Notification : BaseEntity
{
    // The user who should receive/see this notification
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;

    // ── Content ───────────────────────────────────────────────────────────────
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    // Optional deep link (frontend route or external URL)
    public string? Link { get; set; }     // examples: "/projects/123", "/boq-items/456/delay", "/invoices/789/review"

    // Category / type of notification (used for filtering, icons, colors, sounds, etc.)
    public NotificationType Type { get; set; }

    // ── Read / interaction state ──────────────────────────────────────────────
    public bool IsRead { get; set; } = false;
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public DateTime? ReadAt { get; set; }

    // Optional: when the notification was marked as seen/clicked (even if not "read")
    // public DateTime? SeenAt { get; set; }

    // Optional: priority / severity level (if you want to sort or highlight critical ones)
    // public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
}

// You already have this – just making sure it's grouped nicely
public enum NotificationType
{
    General,          // fallback / miscellaneous
    ProjectDelay,
    ItemDelay,
    PhotoReview,      // new photo upload needs review
    InvoiceReview,    // invoice / transaction needs approval
    BudgetWarning,    // approaching limit (e.g. 80–90%)
    BudgetOverrun,    // exceeded budget
    Escalation,       // timeout → escalated to higher role
    MediaReview,

    // Common additions you might want later:
    ApprovalGranted,
     ApprovalRejected,
     PaymentReceived,
     MilestoneAchieved,
     DocumentUploaded,
     TeamMemberAssigned,
}