using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Core BOQ (Bill of Quantities) item – the main building block of the project cost structure
/// Supports both Measured (quantity-based) and Supervision (percentage-based) accounting
/// </summary>
public class BOQItem : BaseEntity
{
    // ── Identification & Basic Info ───────────────────────────────────────────
    public string ItemCode { get; set; } = string.Empty;        // unique code from BOQ/contract
    public string ItemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Unit { get; set; }                           // m³, m², ton, lump sum, etc.

    // ── Accounting & Status ───────────────────────────────────────────────────
    public string AccountingType { get; set; } = "Measured";    // "Measured", "Supervision", "Mixed"
    public string Status { get; set; } = "جديد";               // New, InProgress, Delayed, Completed, etc.

    // ── Project Relationship ──────────────────────────────────────────────────
    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    // ── Schedule ──────────────────────────────────────────────────────────────
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // ── Dependent 1:1 Data (exist only when needed) ───────────────────────────
    public virtual BOQMeasured? MeasuredData { get; set; }
    public virtual BOQSupervision? SupervisionData { get; set; }

    // ── Navigation Collections ────────────────────────────────────────────────
    public virtual ICollection<SiteMedia> SiteMedias { get; set; }
        = new List<SiteMedia>();

    public virtual ICollection<ItemInvoice> Invoices { get; set; }
        = new List<ItemInvoice>();

    public virtual ICollection<ItemDailyLog> DailyLogs { get; set; }
        = new List<ItemDailyLog>();

    public virtual ICollection<BOQItemNote> Notes { get; set; }
        = new List<BOQItemNote>();

    public virtual ICollection<EscalationLog> EscalationLogs { get; set; }
        = new List<EscalationLog>();

    public virtual ICollection<BOQProfitabilityLog> ProfitabilityLogs { get; set; }
        = new List<BOQProfitabilityLog>();

    // ── Computed Properties (not stored in DB) ────────────────────────────────
    /// <summary>
    /// Contract value / estimated budget for this item
    /// Depends on AccountingType and child data
    /// </summary>
    public decimal EstimatedBudget
    {
        get
        {
            if (AccountingType == "Measured")
            {
                return (MeasuredData?.AgreedQuantity ?? 0) * (MeasuredData?.UnitPrice ?? 0);
            }

            return SupervisionData?.EstimatedTotalCost ?? 0;
        }
    }

    // Optional helpers – very useful in UI / reports
    public bool HasMeasuredData => MeasuredData != null;
    public bool HasSupervisionData => SupervisionData != null;
    public bool IsMixedAccounting => AccountingType == "Mixed";
}