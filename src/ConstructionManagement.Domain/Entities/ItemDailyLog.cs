using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Daily progress log / diary entry for a specific BOQ item
/// Used to track actual progress, notes, and closing of daily work
/// </summary>
public class ItemDailyLog : BaseEntity
{
    // Which BOQ item this daily log belongs to
    public int BOQItemId { get; set; }

    [ForeignKey(nameof(BOQItemId))]
    public virtual BOQItem BOQItem { get; set; } = null!;

    // The date this log represents (usually one log per day per item)
    public DateTime LogDate { get; set; }

    // ── Progress & Status ─────────────────────────────────────────────────────
    public decimal? DailyProgressPercentage { get; set; }   // e.g. 2.5%, 15%, null = not measured

    public string? ProgressNotes { get; set; }              // observations, issues, weather impact, etc.

    public bool IsClosed { get; set; } = false;             // day finalized / no more changes allowed

    public string? ClosingNotes { get; set; }               // reason for closing, final remarks

    public DateTime? ClosedAt { get; set; }

    // ── Audit / Responsibility ────────────────────────────────────────────────
    public int CreatedByUserId { get; set; }

    [ForeignKey(nameof(CreatedByUserId))]
    public virtual User CreatedByUser { get; set; } = null!;

    public int? ClosedByUserId { get; set; }

    [ForeignKey(nameof(ClosedByUserId))]
    public virtual User? ClosedByUser { get; set; }

    // Optional: future extension points
    // public int? VerifiedByUserId { get; set; }
    // public virtual User? VerifiedByUser { get; set; }
    // public DateTime? VerifiedAt { get; set; }
}