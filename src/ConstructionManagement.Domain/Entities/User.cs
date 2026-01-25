namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a system user (employee, manager, engineer, client rep, etc.)
/// Central entity for authentication, roles, project assignments, and audit trails
/// </summary>
public class User : BaseEntity
{
    // ── Basic Profile ─────────────────────────────────────────────────────────
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }

    // ── Core Navigation Properties ────────────────────────────────────────────

    /// <summary>
    /// Global/system roles assigned to this user (Admin, Accountant, etc.)
    /// </summary>
    public virtual ICollection<UserRole> UserRoles { get; set; }
        = new List<UserRole>();

    // ── Project Ownership & Management ────────────────────────────────────────

    /// <summary>
    /// Projects where this user is the owner (usually the client or main contractor)
    /// </summary>
    public virtual ICollection<Project> OwnedProjects { get; set; }
        = new List<Project>();

    /// <summary>
    /// Projects where this user is assigned as General Manager
    /// </summary>
    public virtual ICollection<Project> ManagedProjects { get; set; }
        = new List<Project>();

    /// <summary>
    /// Projects that this user has closed/finalized
    /// </summary>
    public virtual ICollection<Project> ClosedProjects { get; set; }
        = new List<Project>();

    // ── Financial & Review Responsibilities ───────────────────────────────────

    /// <summary>
    /// Transactions created by this user
    /// </summary>
    public virtual ICollection<Transaction> CreatedTransactions { get; set; }
        = new List<Transaction>();

    /// <summary>
    /// Transactions reviewed/approved by this user
    /// </summary>
    public virtual ICollection<Transaction> ReviewedTransactions { get; set; }
        = new List<Transaction>();

    /// <summary>
    /// Invoices reviewed by this user
    /// </summary>
    public virtual ICollection<ItemInvoice> ReviewedInvoices { get; set; }
        = new List<ItemInvoice>();

    // ── Media & Documentation ─────────────────────────────────────────────────

    /// <summary>
    /// Media (photos, videos, documents) uploaded by this user
    /// </summary>
    public virtual ICollection<SiteMedia> UploadedMedias { get; set; }
        = new List<SiteMedia>();

    /// <summary>
    /// Media reviewed/approved by this user
    /// </summary>
    public virtual ICollection<SiteMedia> ReviewedMedias { get; set; }
        = new List<SiteMedia>();

    // ── Progress & Daily Logs ─────────────────────────────────────────────────

    /// <summary>
    /// Daily logs created by this user
    /// </summary>
    public virtual ICollection<ItemDailyLog> CreatedDailyLogs { get; set; }
        = new List<ItemDailyLog>();

    /// <summary>
    /// Daily logs closed/finalized by this user
    /// </summary>
    public virtual ICollection<ItemDailyLog> ClosedDailyLogs { get; set; }
        = new List<ItemDailyLog>();

    // ── Notifications & Escalations ───────────────────────────────────────────

    /// <summary>
    /// All in-app notifications sent to this user
    /// </summary>
    public virtual ICollection<Notification> Notifications { get; set; }
        = new List<Notification>();

    /// <summary>
    /// Escalation messages/notifications received by this user
    /// </summary>
    public virtual ICollection<EscalationLog> ReceivedEscalations { get; set; }
        = new List<EscalationLog>();

    // ── Project Memberships (optional but very useful) ────────────────────────

    /// <summary>
    /// All projects this user is assigned to (as team member)
    /// </summary>
    public virtual ICollection<ProjectTeamMember> ProjectMemberships { get; set; }
        = new List<ProjectTeamMember>();
    // In User.cs – add these collections
    
    public virtual ICollection<ItemInvoice> CreatedInvoices { get; set; } = new List<ItemInvoice>();
    // In User.cs – add this collection
    public virtual ICollection<ProjectTeamMember> Subordinates { get; set; } = new List<ProjectTeamMember>();
    // or name it ReportsFrom / ManagedTeamMembers / etc.

    // ── Optional helpers (not mapped) ─────────────────────────────────────────
    // [NotMapped]
    // public bool IsAdmin => UserRoles.Any(ur => ur.Role.Name == "Admin");

    // NOTE: Add tests for navigation consistency and role assignments.
}