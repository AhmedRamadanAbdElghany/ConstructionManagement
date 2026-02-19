namespace ConstructionManagement.Application.DTOs.Portfolio;

public class PortfolioCategoryDto
{
    public int Id { get; set; }
    public int? CompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; }
    public int? ParentCategoryId { get; set; }
    public List<PortfolioCategoryDto> ChildCategories { get; set; } = new();
    public List<PortfolioItemDto> Items { get; set; } = new();
    public int ItemCount { get; set; }
}
