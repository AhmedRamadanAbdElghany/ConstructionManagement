namespace ConstructionManagement.Application.DTOs.Portfolio;

public class PortfolioItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public long? FileSize { get; set; }
    public string? FileType { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Metadata
    public DateTime? CompletionDate { get; set; }
    public string? ClientName { get; set; }
    public string? Location { get; set; }
}
