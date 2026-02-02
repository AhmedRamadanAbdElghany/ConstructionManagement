namespace ConstructionManagement.Domain.Enums;

public enum PackageVariationCalculation
{
    /// <summary>
    /// Add the full cost of the new item without deducting the replaced item's cost.
    /// (Also known as "Add Only")
    /// </summary>
    AddFullCost = 0,

    /// <summary>
    /// Calculate the difference: (New Item Cost - Old Item Cost).
    /// </summary>
    Differential = 1
}
