namespace ConstructionManagement.Application.DTOs.WarehousePartner;

/// <summary>
/// Request to create a new review
/// </summary>
public record CreateReviewRequest(
    int RatedUserId,
    int Rating,
    string? Comment,
    string? Title,
    int? ProjectId
);
