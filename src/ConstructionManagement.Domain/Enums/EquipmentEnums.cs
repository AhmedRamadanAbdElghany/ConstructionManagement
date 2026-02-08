namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Types of equipment utilization tracking
/// </summary>
public enum UtilizationType
{
    Hourly = 1,
    Daily = 2,
    Weekly = 3,
    Monthly = 4,
    ProjectBased = 5
}

/// <summary>
/// Types of equipment assignment
/// </summary>
public enum EquipmentAssignmentType
{
    Rental = 1,
    Lease = 2,
    Owned = 3,
    Borrowed = 4,
    SubcontractorProvided = 5,
    ProjectBased = 6
}

/// <summary>
/// Status of equipment assignment
/// </summary>
public enum AssignmentStatus
{
    Pending = 1,
    Active = 2,
    Completed = 3,
    Cancelled = 4,
    OnHold = 5
}

/// <summary>
/// Types of maintenance
/// </summary>
public enum MaintenanceType
{
    Preventive = 1,
    Corrective = 2,
    Predictive = 3,
    Emergency = 4,
    Routine = 5
}

/// <summary>
/// Status of maintenance
/// </summary>
public enum MaintenanceStatus
{
    Scheduled = 1,
    InProgress = 2,
    Completed = 3,
    Overdue = 4,
    Cancelled = 5
}
