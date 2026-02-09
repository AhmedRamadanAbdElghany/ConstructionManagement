using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// Request to change a user's type
/// </summary>
public record ChangeUserTypeRequest(
    UserType NewUserType,
    string? Reason = null
);
