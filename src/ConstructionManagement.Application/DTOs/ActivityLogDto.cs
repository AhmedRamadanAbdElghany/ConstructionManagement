namespace ConstructionManagement.Application.DTOs;

public class ActivityLogDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int? UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string ActivityType { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
