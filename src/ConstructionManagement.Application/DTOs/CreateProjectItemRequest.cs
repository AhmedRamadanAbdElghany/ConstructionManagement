using System.ComponentModel.DataAnnotations;

namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// Request to create a new ProjectItem (بند المشروع)
/// All fields are optional except ItemName - the accounting system is determined by Project.AccountingSystem
/// </summary>
public class CreateProjectItemRequest
{
    [Required]
    public string ItemName { get; set; } = string.Empty;

    public string? ItemCode { get; set; }
    public string? Description { get; set; }
    public string? Unit { get; set; }
    public int? PhaseId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Measured System Fields (used when Project.AccountingSystem = Measured)
    public decimal? AgreedQuantity { get; set; }
    public decimal? UnitPrice { get; set; }

    // Supervision System Fields (used when Project.AccountingSystem = Supervision)
    public decimal? EstimatedTotalCost { get; set; }
    public decimal? SupervisionPercentage { get; set; }

    // Package System Fields (used when Project.AccountingSystem = Packages)
    public decimal? TotalPackageValue { get; set; }
    public string? PaymentTerms { get; set; }

    // Workflow & Escalation
    public int? ResponsibleUserId { get; set; }
    public bool RequiresPreStartConfirmation { get; set; } = true;
    public int PreStartConfirmationHours { get; set; } = 24;
}

