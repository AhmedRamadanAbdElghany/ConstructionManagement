using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Design status enumeration
/// </summary>
public enum DesignStatus
{
    Draft = 0,
    Active = 1,
    Archived = 2,
    Deprecated = 3
}

/// <summary>
/// Design approval status enumeration
/// </summary>
public enum DesignApprovalStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

/// <summary>
/// Represents a design document in a construction project.
/// Designs can have versions, file attachments, and belong to categories.
/// </summary>
public class Design : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }      // For company templates
    
    public int ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Category relationship (null = root level)
    public int? CategoryId { get; set; }
    [ForeignKey(nameof(CategoryId))]
    public virtual DesignCategory? Category { get; set; }
    
    public DesignStatus Status { get; set; } = DesignStatus.Draft;
    
    // Versioning
    public int Version { get; set; } = 1;
    public int? ParentDesignId { get; set; }  // For versioning chain
    [ForeignKey(nameof(ParentDesignId))]
    public virtual Design? ParentDesign { get; set; }
    
    public virtual ICollection<Design> Versions { get; set; } = new List<Design>();
    
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
    
    // Approval fields
    public DesignApprovalStatus? ApprovalStatus { get; set; }
    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? RejectionReason { get; set; }
    
    // Change notes for version tracking
    public string? ChangeNotes { get; set; }
}
