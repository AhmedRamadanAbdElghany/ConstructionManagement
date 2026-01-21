using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Records payments received from the client/owner for the project
/// (advance payment, interim payments, final payment, etc.)
/// </summary>
public class ClientPayment : BaseEntity
{
    // Primary Key inherited from BaseEntity → public int Id { get; set; }

    // Required: every client payment belongs to one project
    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    // ── Payment metadata ──────────────────────────────────────────────────────
    public string? PaymentNumber { get; set; }          // e.g. "ADV-001", "INT-2025-03", "FINAL-01"

    public DateTime PaymentDate { get; set; }           // actual date the money was received

    public decimal Amount { get; set; }                 // amount received in project currency

    public string? PaymentType { get; set; }            // "Advance", "Interim", "Retention Release", "Final", etc.

    public string? Description { get; set; }            // e.g. "Payment for 30% completion"

    // ── Status & Confirmation ─────────────────────────────────────────────────
    public bool IsConfirmed { get; set; } = false;      // bank transfer confirmed, receipt verified, etc.

    // ── Evidence ──────────────────────────────────────────────────────────────
    public string? AttachmentPath { get; set; }         // path to bank receipt, transfer screenshot, cheque image...

    // Optional future additions you might consider:
    // public string? BankReference { get; set; }
    // public DateTime? ConfirmedAt { get; set; }
    // public int? ConfirmedByUserId { get; set; }
    // public virtual User? ConfirmedBy { get; set; }
}