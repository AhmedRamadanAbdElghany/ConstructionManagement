using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs.Design;

/// <summary>
/// Request DTO for creating a new default design template.
/// </summary>
public class CreateDefaultDesignRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public IFormFile? File { get; set; }
    public bool IsRequired { get; set; } = false;
    public int? Order { get; set; }
    public string? Tags { get; set; }
}

/// <summary>
/// Request DTO for updating a default design template.
/// </summary>
public class UpdateDefaultDesignRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public IFormFile? File { get; set; }
    public bool IsRequired { get; set; }
    public int? Order { get; set; }
    public string? Tags { get; set; }
}

/// <summary>
/// DTO for default design template response.
/// </summary>
public class DefaultDesignDto
{
    public int Id { get; set; }
    public int? CompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public string? OriginalFileName { get; set; }
    public long? FileSize { get; set; }
    public string? FileType { get; set; }
    public bool IsRequired { get; set; }
    public int Order { get; set; }
    public string? Tags { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
