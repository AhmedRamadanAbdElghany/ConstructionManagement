namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Represents the type of user registration
/// </summary>
public enum UserType
{
    /// <summary>
    /// Normal user who can request to join a company
    /// </summary>
    NormalUser = 0,

    /// <summary>
    /// Worker who can request to join a company
    /// </summary>
    Worker = 1,

    /// <summary>
    /// Company owner who can request to create a new company
    /// </summary>
    CompanyOwner = 2,

    /// <summary>
    /// Inventory owner who can manage inventory and warehouse
    /// </summary>
    InventoryOwner = 3,

    /// <summary>
    /// Engineer (civil, architectural, etc.)
    /// </summary>
    Engineer = 5,

    /// <summary>
    /// Subcontractor for specialized work
    /// </summary>
    Subcontractor = 6
}
