namespace ConstructionManagement.Application.DTOs;

public class PublicCompanyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? LogoUrl { get; set; }
    public int CompletedProjectsCount { get; set; }
    public int SubscriberCount { get; set; }
    public bool IsSubscribed { get; set; }
}
