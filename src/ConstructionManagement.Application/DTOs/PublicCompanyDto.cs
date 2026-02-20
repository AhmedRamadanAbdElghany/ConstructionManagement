namespace ConstructionManagement.Application.DTOs;

public class PublicCompanyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? LogoUrl { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public int FollowerCount { get; set; }
    public int PortfolioItemCount { get; set; }
    public bool IsFollowedByCurrentUser { get; set; }
    // Legacy properties for backward compatibility
    public int CompletedProjectsCount { get; set; }
    public int SubscriberCount { get; set; }
    public bool IsSubscribed { get; set; }
}

public class PublicCompanyDetailDto : PublicCompanyDto
{
    public string? BusinessId { get; set; }
    public List<PortfolioItemSummaryDto> PortfolioItems { get; set; } = new();
    public List<PortfolioCategorySummaryDto> PortfolioCategories { get; set; } = new();
}

public class PortfolioItemSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? CategoryName { get; set; }
    public DateTime? CompletedDate { get; set; }
}

public class PortfolioCategorySummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ItemCount { get; set; }
}
