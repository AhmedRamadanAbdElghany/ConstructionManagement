public record SiteMediaDto(
    int MediaID,
    int ProjectID,
    int? ItemID,
    string MediaType,
    string FilePath,
    string? Description,
    string Status,
    string? RejectionReason,
    string UploaderFullName,
    string? ReviewerFullName,
    string? ForwardToFullName,
    DateTime? ReviewDate,
    DateTime CreatedAt);
