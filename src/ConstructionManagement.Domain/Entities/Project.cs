using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a construction project with its core metadata, team, financials, 
/// and related child entities (BOQ, payments, media, settings, rules, etc.)
/// </summary>
public class Project : BaseEntity
{
    public string ProjectName { get; set; } = string.Empty;
    public string? Description { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public virtual ICollection<ItemInvoice> ItemInvoices { get; set; }
        = new List<ItemInvoice>();
    public virtual ICollection<EscalationLog> EscalationLogs { get; set; }
        = new List<EscalationLog>();
    public virtual ICollection<ClientPayment> ClientPayments { get; set; }
        = new List<ClientPayment>();

    public string Status { get; set; } = "جديد";  // New, InProgress, Delayed, Completed, Cancelled, etc.

    // ── Ownership & Management ────────────────────────────────────────────────
    public int OwnerUserId { get; set; }
    [ForeignKey(nameof(OwnerUserId))]
    public virtual User? Owner { get; set; }

    public int? GeneralManagerUserId { get; set; }
    [ForeignKey(nameof(GeneralManagerUserId))]
    public virtual User? GeneralManager { get; set; }

    public int? ClosedByUserId { get; set; }
    [ForeignKey(nameof(ClosedByUserId))]
    public virtual User? ClosedBy { get; set; }

    // داخل كلاس Project
    public int? PackageId { get; set; }
    public virtual Package? Package { get; set; }

    public bool IsClosed { get; set; } = false;
    public DateTime? ClosedAt { get; set; }

    // ── Financial & Accounting ────────────────────────────────────────────────
    public string AccountingSystem { get; set; } = "Mixed";  // Measured, Supervision, Mixed, Other
    public decimal? TotalContractValue { get; set; }

    // ── Navigation Properties ─────────────────────────────────────────────────

    // BOQ (Bill of Quantities) items
    public virtual ICollection<BOQItem> BOQItems { get; set; }
        = new List<BOQItem>();

    // Team members assigned to this project
    public virtual ICollection<ProjectTeamMember> TeamMembers { get; set; }
        = new List<ProjectTeamMember>();


    // 1:1 project-specific settings
    public virtual ProjectSettings? Settings { get; set; }

    // Approval workflow rules (global + item-specific)
    public virtual ICollection<ProjectApprovalRule> ApprovalRules { get; set; }
        = new List<ProjectApprovalRule>();

    // Media (photos, videos, documents) uploaded for this project
    public virtual ICollection<SiteMedia> SiteMedias { get; set; }
        = new List<SiteMedia>();

    // ── Recommended additional collections (add as you implement features) ─────
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public virtual ICollection<BOQItemNote> Notes { get; set; }
            = new List<BOQItemNote>();
    public virtual ICollection<ProjectRole> ProjectRoles { get; set; } = new List<ProjectRole>();

    // NOTE: Add tests for status transitions and date validation.
}