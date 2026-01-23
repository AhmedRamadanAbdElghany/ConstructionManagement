namespace ConstructionManagement.Application.DTOs.Notfification
{
    public record NotificationDto(
        int Id,
        string Title,
        string Message,
        string? Link,
        string Type,
        bool IsRead,
        DateTime CreatedAt,
        DateTime? ReadAt);
}
