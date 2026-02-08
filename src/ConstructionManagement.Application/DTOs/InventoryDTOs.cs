namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// DTO for creating or updating a material
/// </summary>
public class CreateMaterialRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SKU { get; set; }
    public string? Barcode { get; set; }
    public int CategoryId { get; set; }
    public string Unit { get; set; } = "piece";
    public decimal? WeightPerUnit { get; set; }
    public string? Dimensions { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal ReorderQuantity { get; set; }
    public decimal? StandardCost { get; set; }
    public string? SupplierName { get; set; }
    public string? SupplierContact { get; set; }
    public string? SupplierPhone { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsTracked { get; set; } = true;
    public bool TrackExpiration { get; set; } = false;
    public int? ShelfLifeDays { get; set; }
    public string? StorageLocation { get; set; }
    public string? Notes { get; set; }
    public string? ImageUrl { get; set; }
    public int? CompanyId { get; set; }
}

/// <summary>
/// DTO for material response
/// </summary>
public class MaterialDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SKU { get; set; }
    public string? Barcode { get; set; }
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal? WeightPerUnit { get; set; }
    public string? Dimensions { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal ReorderQuantity { get; set; }
    public decimal? StandardCost { get; set; }
    public decimal? AverageCost { get; set; }
    public string? SupplierName { get; set; }
    public string? SupplierContact { get; set; }
    public string? SupplierPhone { get; set; }
    public bool IsActive { get; set; }
    public bool IsTracked { get; set; }
    public bool TrackExpiration { get; set; }
    public int? ShelfLifeDays { get; set; }
    public string? StorageLocation { get; set; }
    public string? Notes { get; set; }
    public string? ImageUrl { get; set; }
    public decimal TotalStock { get; set; }
    public string? StockStatus { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating or updating a material category
/// </summary>
public class CreateMaterialCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int? ParentCategoryId { get; set; }
}

/// <summary>
/// DTO for material category response
/// </summary>
public class MaterialCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int? ParentCategoryId { get; set; }
    public string? ParentCategoryName { get; set; }
    public int MaterialCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for stock level response
/// </summary>
public class MaterialStockDto
{
    public int Id { get; set; }
    public int MaterialId { get; set; }
    public string? MaterialName { get; set; }
    public string WarehouseId { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public decimal CurrentQuantity { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal AvailableQuantity { get; set; }
    public string? BinLocation { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? LastRestockDate { get; set; }
    public decimal? UnitCost { get; set; }
}

/// <summary>
/// DTO for creating a material request
/// </summary>
public class CreateMaterialRequestDto
{
    public int ProjectId { get; set; }
    public string Priority { get; set; } = "Normal";
    public DateTime? RequiredDate { get; set; }
    public string SourceWarehouse { get; set; } = "main";
    public string? DeliveryLocation { get; set; }
    public string? Notes { get; set; }
    public List<CreateMaterialRequestItemDto> Items { get; set; } = new();
}

/// <summary>
/// DTO for request item
/// </summary>
public class CreateMaterialRequestItemDto
{
    public int MaterialId { get; set; }
    public decimal RequestedQuantity { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for material request response
/// </summary>
public class MaterialRequestDto
{
    public int Id { get; set; }
    public string RequestNumber { get; set; } = string.Empty;
    public int ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public int RequestedByUserId { get; set; }
    public string? RequestedByUserName { get; set; }
    public int? ApprovedByUserId { get; set; }
    public string? ApprovedByUserName { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public DateTime? RequiredDate { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public string SourceWarehouse { get; set; } = string.Empty;
    public string? DeliveryLocation { get; set; }
    public string? Notes { get; set; }
    public string? RejectionReason { get; set; }
    public decimal? EstimatedCost { get; set; }
    public decimal? ActualCost { get; set; }
    public List<MaterialRequestItemDto> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for request item response
/// </summary>
public class MaterialRequestItemDto
{
    public int Id { get; set; }
    public int MaterialId { get; set; }
    public string? MaterialName { get; set; }
    public string? MaterialSKU { get; set; }
    public decimal RequestedQuantity { get; set; }
    public decimal ApprovedQuantity { get; set; }
    public decimal FulfilledQuantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public decimal? UnitCost { get; set; }
    public decimal? TotalCost { get; set; }
}

/// <summary>
/// DTO for creating material consumption
/// </summary>
public class CreateMaterialConsumptionDto
{
    public int MaterialId { get; set; }
    public int ProjectId { get; set; }
    public int? PhaseId { get; set; }
    public int? BOQItemId { get; set; }
    public int? ItemDailyLogId { get; set; }
    public int? MaterialRequestId { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal? UnitCost { get; set; }
    public DateTime ConsumptionDate { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for consumption response
/// </summary>
public class MaterialConsumptionDto
{
    public int Id { get; set; }
    public int MaterialId { get; set; }
    public string? MaterialName { get; set; }
    public string? MaterialSKU { get; set; }
    public int ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public int? PhaseId { get; set; }
    public string? PhaseName { get; set; }
    public int? BOQItemId { get; set; }
    public int? ItemDailyLogId { get; set; }
    public int? MaterialRequestId { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal? UnitCost { get; set; }
    public decimal? TotalCost { get; set; }
    public DateTime ConsumptionDate { get; set; }
    public int RecordedByUserId { get; set; }
    public string? RecordedByUserName { get; set; }
    public string? Notes { get; set; }
    public bool IsVerified { get; set; }
    public int? VerifiedByUserId { get; set; }
    public DateTime? VerifiedDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for warehouse
/// </summary>
public class WarehouseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public int? ManagerUserId { get; set; }
    public string? ManagerUserName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? OperatingHours { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for stock adjustment
/// </summary>
public class StockAdjustmentDto
{
    public int MaterialId { get; set; }
    public string WarehouseId { get; set; } = "main";
    public decimal Quantity { get; set; }
    public string TransactionType { get; set; } = "Adjustment";
    public string? Notes { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpirationDate { get; set; }
}

/// <summary>
/// DTO for inventory summary
/// </summary>
public class InventorySummaryDto
{
    public int TotalMaterials { get; set; }
    public int LowStockItems { get; set; }
    public int OutOfStockItems { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public int PendingRequests { get; set; }
    public int TodaysConsumptions { get; set; }
}
