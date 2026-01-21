// Application/DTOs/UpdateBOQItemRequest.cs
public record UpdateBOQItemRequest(
    string? ItemName,
    string? Description,
    string? Status,
    DateTime? StartDate,
    DateTime? EndDate);