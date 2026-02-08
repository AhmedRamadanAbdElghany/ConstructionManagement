namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Unit of measurement for materials
/// </summary>
public enum MaterialUnit
{
    Piece = 0,
    Kg = 1,
    Ton = 2,
    Meter = 3,
    SquareMeter = 4,
    CubicMeter = 5,
    Liter = 6,
    Bag = 7,
    Box = 8,
    Pallet = 9,
    Set = 10,
    Bundle = 11,
    Roll = 12,
    Sheet = 13,
    Block = 14,
    Unit = 15
}

/// <summary>
/// Stock status for inventory items
/// </summary>
public enum StockStatus
{
    InStock = 0,
    LowStock = 1,
    OutOfStock = 2,
    OnOrder = 3,
    Discontinued = 4
}

/// <summary>
/// Transaction type for stock movements
/// </summary>
public enum StockTransactionType
{
    Purchase = 0,
    Receipt = 1,
    TransferIn = 2,
    TransferOut = 3,
    Adjustment = 4,
    Return = 5,
    Consumption = 6,
    Damage = 7,
    Expiration = 8
}

/// <summary>
/// Material request status
/// </summary>
public enum MaterialRequestStatus
{
    Pending = 0,
    Approved = 1,
    PartiallyFulfilled = 2,
    Fulfilled = 3,
    Rejected = 4,
    Cancelled = 5
}

/// <summary>
/// Material request priority
/// </summary>
public enum MaterialRequestPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}

/// <summary>
/// Consumption type for materials
/// </summary>
public enum ConsumptionType
{
    DailyLog = 0,
    Direct = 1,
    RequestFulfillment = 2,
    Transfer = 3,
    Adjustment = 4
}
