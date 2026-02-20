namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Defines the status of a location request
/// </summary>
public enum LocationRequestStatus
{
    /// <summary>
    /// Request is pending - waiting for worker to submit location
    /// </summary>
    Pending = 1,
    
    /// <summary>
    /// Worker has submitted location in response to request
    /// </summary>
    Fulfilled = 2,
    
    /// <summary>
    /// Request has expired without response
    /// </summary>
    Expired = 3,
    
    /// <summary>
    /// Request was cancelled by admin
    /// </summary>
    Cancelled = 4
}
