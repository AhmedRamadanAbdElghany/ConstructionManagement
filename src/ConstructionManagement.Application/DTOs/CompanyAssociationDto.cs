namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// Represents a user's association with a company
/// </summary>
public record CompanyAssociationDto(
    int CompanyId,
    string CompanyName,
    string Role,
    string Status,
    DateTime ContractStartDate,
    DateTime? ContractEndDate
);
