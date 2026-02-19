using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs.Portfolio;

public class CreatePortfolioItemRequest
{
    [Required(ErrorMessage = "Item name is required")]
    [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters")]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
    public string? Description { get; set; }
    
    public int? CategoryId { get; set; }
    public IFormFile? File { get; set; }
    
    // Metadata
    public DateTime? CompletionDate { get; set; }
    
    [StringLength(200, ErrorMessage = "Client name cannot exceed 200 characters")]
    public string? ClientName { get; set; }
    
    [StringLength(300, ErrorMessage = "Location cannot exceed 300 characters")]
    public string? Location { get; set; }
}
