using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a default design template at the company level.
/// These are used as templates for new projects.
/// </summary>
public class CompanyDefaultDesign : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company Company { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Category relationship (null = root level)
    public int? CategoryId { get; set; }
    [ForeignKey(nameof(CategoryId))]
    public virtual CompanyDefaultDesignCategory? Category { get; set; }

    // File Information
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public long? FileSize { get; set; }
    public string? FileType { get; set; }
    public string? OriginalFileName { get; set; }

    // Metadata
    public int? CreatedByUserId { get; set; }
    [ForeignKey(nameof(CreatedByUserId))]
    public virtual User? CreatedByUser { get; set; }

    // Indicates if this is a required design for all projects
    public bool IsRequired { get; set; } = false;

    // Order for sorting within category
    public int Order { get; set; } = 0;

    // Tags for categorization (comma-separated)
    public string? Tags { get; set; }
}
