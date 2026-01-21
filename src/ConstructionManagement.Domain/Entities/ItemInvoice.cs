using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Invoice / payment request related to a specific BOQ item
/// Represents costs incurred (materials, labor, subcontractor, etc.)
/// </summary>
public class ItemInvoice : BaseEntity
{
    // Primary Key inherited from BaseEntity → public int Id { get; set; }

    // Required: every invoice belongs to one BOQ item
    public int BOQItemId { get; set; }

    [ForeignKey(nameof(BOQItemId))]
    public virtual BOQItem BOQItem { get; set; } = null!;

    // Optional but very useful: direct link to project (for fast filtering / reporting)
    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    // ── Invoice metadata ──────────────────────────────────────────────────────
    public string? InvoiceNumber { get; set; }          // supplier's invoice number
    public DateTime InvoiceDate { get; set; }           // date on the invoice
    public decimal Amount { get; set; }                 // total amount claimed / paid
    public string? Description { get; set; }
    public string? SupplierVendor { get; set; }         // supplier / subcontractor name

    // ── Approval workflow ─────────────────────────────────────────────────────
    public string Status { get; set; } = "Pending";     // Pending, Approved, Rejected, Forwarded, Paid, etc.
    public string? RejectionReason { get; set; }

    public int? ReviewerUserId { get; set; }
    [ForeignKey(nameof(ReviewerUserId))]
    public virtual User? Reviewer { get; set; }

    public DateTime? ReviewDate { get; set; }

    // ── Attachments ───────────────────────────────────────────────────────────
    public string? AttachmentPath { get; set; }         // path / URL to invoice PDF / photo

    // Optional future additions:
    // public DateTime? PaymentDate { get; set; }
    // public decimal? PaidAmount { get; set; }
    // public string? PaymentReference { get; set; }
}