namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service for accessing current user information from the HTTP context
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the current user's ID
    /// </summary>
    int UserId { get; }

    /// <summary>
    /// Gets the current user's company ID (null if not associated with a company)
    /// </summary>
    int? CompanyId { get; }

    /// <summary>
    /// Gets the current user's email
    /// </summary>
    string? Email { get; }

    /// <summary>
    /// Gets the current user's full name
    /// </summary>
    string? FullName { get; }

    /// <summary>
    /// Checks if the current user is authenticated
    /// </summary>
    bool IsAuthenticated { get; }

    /// <summary>
    /// Gets the current user's roles
    /// </summary>
    IEnumerable<string> Roles { get; }

    /// <summary>
    /// Checks if the current user has a specific role
    /// </summary>
    bool IsInRole(string role);
}
