using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a work item/file in the company's portfolio.
/// </summary>
public class PortfolioItem : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    public int? CategoryId { get; set; }
    [ForeignKey(nameof(CategoryId))]
    public virtual PortfolioCategory? Category { get; set; }
    
    // File Information
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public long? FileSize { get; set; }
    public string? FileType { get; set; }
    public string? OriginalFileName { get; set; }
    
    // Metadata
    public DateTime? CompletionDate { get; set; }
    public string? ClientName { get; set; }
    public string? Location { get; set; }
}
