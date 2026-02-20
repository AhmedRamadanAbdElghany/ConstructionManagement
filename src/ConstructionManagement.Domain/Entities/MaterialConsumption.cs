using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents the consumption of materials on a project (from daily logs or direct consumption)
/// </summary>
public class MaterialConsumption : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Material consumed
    /// </summary>
    public int MaterialId { get; set; }
    [ForeignKey(nameof(MaterialId))]
    public virtual Material? Material { get; set; }
    
    /// <summary>
    /// Project where material was consumed
    /// </summary>
    public int ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }
    
    /// <summary>
    /// Related phase (if applicable)
    /// </summary>
    public int? PhaseId { get; set; }
    [ForeignKey(nameof(PhaseId))]
    public virtual Phase? Phase { get; set; }
    
    /// <summary>
    /// Related project item (if applicable)
    /// </summary>
    public int? ProjectItemId { get; set; }
    [ForeignKey(nameof(ProjectItemId))]
    public virtual ProjectItem? ProjectItem { get; set; }
    
    /// <summary>
    /// Related daily log entry
    /// </summary>
    public int? ItemDailyLogId { get; set; }
    [ForeignKey(nameof(ItemDailyLogId))]
    public virtual ItemDailyLog? ItemDailyLog { get; set; }
    
    /// <summary>
    /// Related material request (if fulfilled from request)
    /// </summary>
    public int? MaterialRequestId { get; set; }
    [ForeignKey(nameof(MaterialRequestId))]
    public virtual MaterialRequest? MaterialRequest { get; set; }
    
    /// <summary>
    /// Quantity consumed
    /// </summary>
    public decimal Quantity { get; set; }
    
    /// <summary>
    /// Unit of measurement
    /// </summary>
    public string Unit { get; set; } = string.Empty;
    
    /// <summary>
    /// Cost per unit at time of consumption
    /// </summary>
    public decimal? UnitCost { get; set; }
    
    /// <summary>
    /// Total cost
    /// </summary>
    public decimal? TotalCost => UnitCost * Quantity;
    
    /// <summary>
    /// Date of consumption
    /// </summary>
    public DateTime ConsumptionDate { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// User who recorded the consumption
    /// </summary>
    public int RecordedByUserId { get; set; }
    [ForeignKey(nameof(RecordedByUserId))]
    public virtual User? RecordedByUser { get; set; }
    
    /// <summary>
    /// Description or notes
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// Is this consumption verified
    /// </summary>
    public bool IsVerified { get; set; } = false;
    
    /// <summary>
    /// Verified by user
    /// </summary>
    public int? VerifiedByUserId { get; set; }
    [ForeignKey(nameof(VerifiedByUserId))]
    public virtual User? VerifiedByUser { get; set; }
    
    /// <summary>
    /// Verification date
    /// </summary>
    public DateTime? VerifiedDate { get; set; }
    
    // Navigation Properties
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}
