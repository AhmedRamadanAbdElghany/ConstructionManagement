using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.DTOs.Design;

/// <summary>
/// Data transfer object for Design entity.
/// </summary>
public class DesignDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public DesignStatus Status { get; set; }
    public int Version { get; set; }
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public string? OriginalFileName { get; set; }
    public long? FileSize { get; set; }
    public string? FileType { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int VersionCount { get; set; }
    public string? ChangeNotes { get; set; }
    
    // Approval fields
    public DesignApprovalStatus? ApprovalStatus { get; set; }
    public int? ApprovedByUserId { get; set; }
    public string? ApprovedByUserName { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? RejectionReason { get; set; }
    public int? ParentDesignId { get; set; }
}
