namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Defines the type of geofence zone
/// </summary>
public enum ZoneType
{
    /// <summary>
    /// Circular zone defined by center point and radius
    /// </summary>
    Circle = 1,
    
    /// <summary>
    /// Polygon zone defined by multiple vertices (GeoJSON)
    /// </summary>
    Polygon = 2
}
