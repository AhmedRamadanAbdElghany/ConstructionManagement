namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Contract status for company-user relationships
/// </summary>
public enum ContractStatus
{
    /// <summary>
    /// Contract is pending approval
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Contract is active and in effect
    /// </summary>
    Active = 1,

    /// <summary>
    /// Contract has been terminated
    /// </summary>
    Terminated = 2,

    /// <summary>
    /// Contract is suspended temporarily
    /// </summary>
    Suspended = 3
}
