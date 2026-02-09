using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service interface for managing user type changes
/// </summary>
public interface IUserTypeService
{
    /// <summary>
    /// Change a user's type
    /// </summary>
    Task<bool> ChangeUserTypeAsync(int userId, UserType newType, string? reason = null);

    /// <summary>
    /// Get the history of user type changes
    /// </summary>
    Task<List<UserTypeHistory>> GetUserTypeHistoryAsync(int userId);

    /// <summary>
    /// Get all user types a user has been (including current)
    /// </summary>
    Task<List<UserType>> GetUserTypeHistoryForNotificationsAsync(int userId);

    /// <summary>
    /// Check if a user can switch to a specific type
    /// </summary>
    Task<bool> CanSwitchToTypeAsync(int userId, UserType targetType);
}
