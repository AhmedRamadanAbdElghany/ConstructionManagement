using ConstructionManagement.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs.Design;

/// <summary>
/// Request DTO for updating an existing design.
/// </summary>
public class UpdateDesignRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public DesignStatus Status { get; set; } = DesignStatus.Draft;
    public IFormFile? File { get; set; }
    public string? ChangeNotes { get; set; }
    public bool SubmitForApproval { get; set; } = false;
}
