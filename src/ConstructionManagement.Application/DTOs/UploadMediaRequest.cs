// Application/DTOs/UploadMediaRequest.cs
using ConstructionManagement.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs;

public class UploadMediaRequest
{
    public string MediaType { get; set; } = "Image";
    public string? Description { get; set; }
    public SourceType SourceType { get; set; }
    public int? ItemId { get; set; } // ضيفه هنا بدل ما يكون في الـ Query
    public required IFormFile File { get; set; } // لازم يكون جزء من الـ Class
}
