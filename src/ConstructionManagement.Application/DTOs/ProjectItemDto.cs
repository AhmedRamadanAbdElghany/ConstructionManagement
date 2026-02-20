namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// DTO for ProjectItem (بند المشروع)
/// All fields are included in one DTO - the accounting system is determined by Project.AccountingSystem
/// </summary>
public class ProjectItemDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int? PhaseId { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Unit { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Measured System Fields
    public decimal? AgreedQuantity { get; set; }
    public decimal? ExecutedQuantity { get; set; }
    public decimal? UnitPrice { get; set; }

    // Supervision System Fields
    public decimal? EstimatedTotalCost { get; set; }
    public decimal? SupervisionPercentage { get; set; }

    // Package System Fields
    public decimal? TotalPackageValue { get; set; }

    // Computed
    public decimal EstimatedBudget { get; set; }
    public decimal ProgressPercentage { get; set; }
}
