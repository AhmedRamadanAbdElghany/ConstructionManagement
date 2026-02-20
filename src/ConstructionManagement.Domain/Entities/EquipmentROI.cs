using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Performance rating for equipment ROI.
/// </summary>
public enum PerformanceRating
{
    /// <summary>
    /// Excellent ROI (>= 50%).
    /// </summary>
    Excellent = 5,
    
    /// <summary>
    /// Very Good ROI (25-49%).
    /// </summary>
    VeryGood = 4,
    
    /// <summary>
    /// Good ROI (10-24%).
    /// </summary>
    Good = 3,
    
    /// <summary>
    /// Acceptable ROI (0-9%).
    /// </summary>
    Acceptable = 2,
    
    /// <summary>
    /// Poor ROI (< 0%).
    /// </summary>
    Poor = 1
}

/// <summary>
/// Tracks ROI (Return on Investment) for equipment.
/// Compares costs vs. value added to projects.
/// </summary>
public class EquipmentROI : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Tenant identifier for data isolation.
    /// </summary>
    public int? CompanyId { get; set; }
    
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }

    /// <summary>
    /// The equipment being analyzed.
    /// </summary>
    [Required]
    public int EquipmentId { get; set; }
    
    [ForeignKey(nameof(EquipmentId))]
    public virtual Equipment Equipment { get; set; } = null!;

    /// <summary>
    /// The project (if analyzing per-project ROI).
    /// </summary>
    public int? ProjectId { get; set; }
    
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }

    /// <summary>
    /// Start of the analysis period.
    /// </summary>
    [Required]
    public DateTime PeriodStart { get; set; }

    /// <summary>
    /// End of the analysis period.
    /// </summary>
    [Required]
    public DateTime PeriodEnd { get; set; }

    #region Costs

    /// <summary>
    /// Fuel costs during the period.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal FuelCost { get; set; }

    /// <summary>
    /// Maintenance costs during the period.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal MaintenanceCost { get; set; }

    /// <summary>
    /// Operator/labor costs during the period.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal OperatorCost { get; set; }

    /// <summary>
    /// Depreciation cost for the period.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal DepreciationCost { get; set; }

    /// <summary>
    /// Insurance costs during the period.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal InsuranceCost { get; set; }

    /// <summary>
    /// Other operating costs.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal OtherCosts { get; set; }

    /// <summary>
    /// Total costs for the period.
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalCost { get; set; }

    #endregion

    #region Revenue/Value

    /// <summary>
    /// Value of work completed using this equipment.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal WorkValue { get; set; }

    /// <summary>
    /// Rental income (if equipment was rented out).
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal RentalIncome { get; set; }

    /// <summary>
    /// Total hours the equipment was used.
    /// </summary>
    [Column(TypeName = "decimal(10,2)")]
    public decimal HoursWorked { get; set; }

    /// <summary>
    /// Number of projects the equipment was used on.
    /// </summary>
    public int ProjectsCount { get; set; }

    #endregion

    #region Calculated Metrics

    /// <summary>
    /// Cost per hour of operation.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal CostPerHour { get; set; }

    /// <summary>
    /// Revenue per hour of operation.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal RevenuePerHour { get; set; }

    /// <summary>
    /// Profit per hour of operation.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal ProfitPerHour { get; set; }

    /// <summary>
    /// ROI percentage ((Revenue - Cost) / Cost * 100).
    /// </summary>
    [Column(TypeName = "decimal(10,2)")]
    public decimal ROI_Percentage { get; set; }

    /// <summary>
    /// Utilization rate (hours used / available hours).
    /// </summary>
    [Column(TypeName = "decimal(5,2)")]
    public decimal? UtilizationRate { get; set; }

    /// <summary>
    /// Performance rating based on ROI.
    /// </summary>
    public PerformanceRating PerformanceRating { get; set; }

    #endregion

    /// <summary>
    /// Additional notes about the analysis.
    /// </summary>
    [MaxLength(1000)]
    public string? Notes { get; set; }
}

/// <summary>
/// Detailed cost breakdown for equipment.
/// </summary>
public class EquipmentCostBreakdown : BaseEntity
{
    /// <summary>
    /// The equipment this breakdown is for.
    /// </summary>
    [Required]
    public int EquipmentId { get; set; }
    
    [ForeignKey(nameof(EquipmentId))]
    public virtual Equipment Equipment { get; set; } = null!;

    /// <summary>
    /// The ROI record this breakdown belongs to.
    /// </summary>
    public int? EquipmentROIId { get; set; }
    
    [ForeignKey(nameof(EquipmentROIId))]
    public virtual EquipmentROI? EquipmentROI { get; set; }

    /// <summary>
    /// Date of the cost.
    /// </summary>
    [Required]
    public DateTime Date { get; set; }

    /// <summary>
    /// Type of cost (Fuel, Maintenance, Operator, etc.).
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string CostType { get; set; } = string.Empty;

    /// <summary>
    /// Description of the cost.
    /// </summary>
    [MaxLength(200)]
    public string? Description { get; set; }

    /// <summary>
    /// Cost amount.
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    /// <summary>
    /// Currency code.
    /// </summary>
    [MaxLength(10)]
    public string Currency { get; set; } = "EGP";

    /// <summary>
    /// Reference to the source record (e.g., maintenance record ID).
    /// </summary>
    public int? SourceId { get; set; }

    /// <summary>
    /// Type of source record.
    /// </summary>
    [MaxLength(50)]
    public string? SourceType { get; set; }
}
