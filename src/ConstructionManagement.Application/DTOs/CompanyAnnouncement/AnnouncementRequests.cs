using System.ComponentModel.DataAnnotations;
using ConstructionManagement.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs.CompanyAnnouncement;

public class CreateAnnouncementRequest
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Content is required")]
    [StringLength(10000, ErrorMessage = "Content cannot exceed 10000 characters")]
    public string Content { get; set; } = string.Empty;
    
    public AnnouncementType Type { get; set; } = AnnouncementType.General;
    public IFormFile? Image { get; set; }
    public bool IsPublished { get; set; } = true;
}

public class UpdateAnnouncementRequest
{
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string? Title { get; set; }
    
    [StringLength(10000, ErrorMessage = "Content cannot exceed 10000 characters")]
    public string? Content { get; set; }
    
    public AnnouncementType? Type { get; set; }
    public IFormFile? Image { get; set; }
    public bool? IsPublished { get; set; }
}
