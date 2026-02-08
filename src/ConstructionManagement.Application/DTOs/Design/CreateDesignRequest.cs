using ConstructionManagement.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs.Design;

/// <summary>
/// Request DTO for creating a new design.
/// </summary>
public class CreateDesignRequest
{
    public int ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public DesignStatus Status { get; set; } = DesignStatus.Draft;
    public IFormFile? File { get; set; }
    public string? ChangeNotes { get; set; }
    public int? ParentDesignId { get; set; }
    public bool CreateAsNewVersion { get; set; } = false;
    public bool SubmitForApproval { get; set; } = false;
}
