// Application/DTOs/UploadMediaRequest.cs
using ConstructionManagement.Domain.Entities;

public record UploadMediaRequest(
    string MediaType,                    // "Image" or "Video"
    string? Description,
    SourceType SourceType);