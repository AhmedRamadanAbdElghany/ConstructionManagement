namespace ConstructionManagement.Application.DTOs;

public record BOQItemDto(
    int ItemID,
    string ItemCode,
    string ItemName,
    string AccountingType,
    string Status,
    DateTime? StartDate,
    DateTime? EndDate,
    decimal Progress, // تأكد أن الاسم مطابق لما تستخدمه في Assert
    string? Notes
    // NOTE: Add tests for Progress mapping accuracy.
);
