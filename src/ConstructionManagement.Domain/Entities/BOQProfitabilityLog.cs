using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Historical snapshot of profitability calculation for a specific BOQ item
/// Used to track profit/loss trend over time (daily, weekly, or on-demand logs)
/// </summary>
public class BOQProfitabilityLog : BaseEntity, ITenantEntity
{
    /// <summary>
    /// Tenant identifier for data isolation
    /// </summary>
    public string TenantId { get; set; } = "ConstructionDB";

    // Which BOQ item this profitability snapshot refers to
    public int BOQItemId { get; set; }

    [ForeignKey(nameof(BOQItemId))]
    public virtual BOQItem BOQItem { get; set; } = null!;

    // -- Financial snapshot values ---------------------------------------------

    /// <summary>
    /// Total approved/actual costs spent on this BOQ item up to LogDate
    /// (materials + labor + subcontractors + overheads allocated)
    /// </summary>
    public decimal TotalSpent { get; set; }

    /// <summary>
    /// Contracted/estimated revenue/budget allocated for this BOQ item
    /// Usually comes from MeasuredData or SupervisionData
    /// </summary>
    public decimal EstimatedBudget { get; set; }

    /// <summary>
    /// Instant profit = EstimatedBudget - TotalSpent
    /// Can be negative (loss)
    /// </summary>
    public decimal CurrentProfit { get; set; }

    /// <summary>
    /// Profit margin percentage = (CurrentProfit / EstimatedBudget) × 100
    /// Usually stored as 0–100 or -8 to +8 depending on loss
    /// </summary>
    public decimal ProfitPercentage { get; set; }

    // -- When this snapshot was taken ------------------------------------------
    public DateTime LogDate { get; set; } = DateTime.UtcNow;

    // Optional – very useful for understanding context
    // public string LogReason { get; set; } = "DailyAuto";  
    //   // "DailyAuto", "Manual", "AfterPayment", "AfterInvoiceApproval", etc.

    // Optional – if you want to know who triggered/created the log
    // public int? CreatedByUserId { get; set; }
    // public virtual User? CreatedBy { get; set; }
}
