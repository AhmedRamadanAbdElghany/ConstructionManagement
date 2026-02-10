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

// ── Inventory Order System DTOs ─────────────────────────────────────────────

/// <summary>
/// DTO for creating inventory warehouse
/// </summary>
public class CreateInventoryWarehouseRequest
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? Capacity { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

/// <summary>
/// DTO for inventory warehouse response
/// </summary>
public class InventoryWarehouseDto
{
    public int Id { get; set; }
    public int OwnerUserId { get; set; }
    public string? OwnerUserName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? Capacity { get; set; }
    public bool IsActive { get; set; }
    public bool IsApproved { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public int? CompanyId { get; set; }
    public List<InventoryStockDto>? Stocks { get; set; }
}

/// <summary>
/// DTO for creating inventory stock
/// </summary>
public class CreateInventoryStockRequest
{
    public int WarehouseId { get; set; }
    public string MaterialType { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal CurrentQuantity { get; set; }
    public decimal MinLevel { get; set; }
    public bool AutoReorderEnabled { get; set; } = false;
    public decimal? ReorderPoint { get; set; }
    public decimal? ReorderQuantity { get; set; }
    public decimal PricePerUnit { get; set; }
    public decimal? DiscountedPrice { get; set; }
    public string? BinLocation { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpirationDate { get; set; }
}

/// <summary>
/// DTO for inventory stock response
/// </summary>
public class InventoryStockDto
{
    public int Id { get; set; }
    public int WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public string MaterialType { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal CurrentQuantity { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal AvailableQuantity { get; set; }
    public decimal MinLevel { get; set; }
    public bool AutoReorderEnabled { get; set; }
    public decimal? ReorderPoint { get; set; }
    public decimal PricePerUnit { get; set; }
    public decimal? DiscountedPrice { get; set; }
    public string? BinLocation { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public List<StockDiscountTierDto>? DiscountTiers { get; set; }
}

/// <summary>
/// DTO for stock discount tier
/// </summary>
public class CreateStockDiscountTierRequest
{
    public int StockId { get; set; }
    public string TierName { get; set; } = string.Empty;
    public decimal MinQuantity { get; set; }
    public decimal? MaxQuantity { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal? DiscountAmount { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Priority { get; set; }
}

/// <summary>
/// DTO for stock discount tier response
/// </summary>
public class StockDiscountTierDto
{
    public int Id { get; set; }
    public int StockId { get; set; }
    public string TierName { get; set; } = string.Empty;
    public decimal MinQuantity { get; set; }
    public decimal? MaxQuantity { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal? DiscountAmount { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
    public int Priority { get; set; }
}

/// <summary>
/// DTO for customer tier discount
/// </summary>
public class CustomerTierDiscountDto
{
    public int Id { get; set; }
    public int CustomerUserId { get; set; }
    public string? CustomerUserName { get; set; }
    public int SupplierUserId { get; set; }
    public string? SupplierUserName { get; set; }
    public int Tier { get; set; }
    public string TierName { get; set; } = string.Empty;
    public decimal DiscountPercent { get; set; }
    public int TotalOrdersCount { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
}

/// <summary>
/// DTO for special promotion
/// </summary>
public class CreateSpecialPromotionRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DiscountCode { get; set; } = string.Empty;
    public decimal DiscountPercent { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public int? MaxUsageCount { get; set; }
    public int? MaxUsagePerCustomer { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool ApplyToAllItems { get; set; } = false;
    public string? ApplicableMaterialTypes { get; set; }
}

/// <summary>
/// DTO for special promotion response
/// </summary>
public class SpecialPromotionDto
{
    public int Id { get; set; }
    public int SupplierUserId { get; set; }
    public string? SupplierUserName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DiscountCode { get; set; } = string.Empty;
    public decimal DiscountPercent { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public int? MaxUsageCount { get; set; }
    public int CurrentUsageCount { get; set; }
    public int? MaxUsagePerCustomer { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool ApplyToAllItems { get; set; }
    public string? ApplicableMaterialTypes { get; set; }
    public bool IsActive { get; set; }
    public bool IsValid { get; set; }
}

/// <summary>
/// DTO for validating discount code
/// </summary>
public class ValidateDiscountRequest
{
    public string DiscountCode { get; set; } = string.Empty;
    public List<OrderItemDiscountRequest> Items { get; set; } = new();
}

/// <summary>
/// DTO for order item in discount calculation
/// </summary>
public class OrderItemDiscountRequest
{
    public int StockId { get; set; }
    public decimal Quantity { get; set; }
}

/// <summary>
/// DTO for discount validation response
/// </summary>
public class DiscountValidationResponse
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    public string? AppliedDiscountCode { get; set; }
    public decimal OriginalSubtotal { get; set; }
    public decimal BulkDiscountAmount { get; set; }
    public decimal LoyaltyDiscountAmount { get; set; }
    public decimal PromoDiscountAmount { get; set; }
    public decimal TotalDiscount { get; set; }
    public decimal FinalTotal { get; set; }
}

/// <summary>
/// DTO for creating inventory order
/// </summary>
public class CreateInventoryOrderRequest
{
    public int InventoryOwnerUserId { get; set; }
    public int? WarehouseId { get; set; }
    public int ProjectId { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? DeliveryNotes { get; set; }
    public string? Notes { get; set; }
    public string? AppliedDiscountCode { get; set; }
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}

/// <summary>
/// DTO for creating order item
/// </summary>
public class CreateOrderItemRequest
{
    public int StockId { get; set; }
    public decimal Quantity { get; set; }
    public decimal? NegotiatedPrice { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for inventory order response
/// </summary>
public class InventoryOrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int PaymentStatus { get; set; }
    public string PaymentStatusName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
    public DateTime? PaymentDueDate { get; set; }
    public decimal SubTotal { get; set; }
    public decimal? DiscountPercent { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? Tax { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public string? AppliedDiscountCode { get; set; }
    public decimal? BulkDiscountAmount { get; set; }
    public decimal? LoyaltyDiscountAmount { get; set; }
    public decimal? PromoDiscountAmount { get; set; }
    public string? Notes { get; set; }
    public int CompanyOwnerUserId { get; set; }
    public string? CompanyOwnerUserName { get; set; }
    public int InventoryOwnerUserId { get; set; }
    public string? InventoryOwnerUserName { get; set; }
    public int? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public int ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? DeliveryNotes { get; set; }
    public string? DriverName { get; set; }
    public string? DriverPhone { get; set; }
    public string? VehicleNumber { get; set; }
    public List<InventoryOrderItemDto>? Items { get; set; }
    public List<InventoryOrderEventDto>? Events { get; set; }
    public List<PaymentHistoryDto>? PaymentHistory { get; set; }
}

/// <summary>
/// DTO for inventory order item
/// </summary>
public class InventoryOrderItemDto
{
    public int Id { get; set; }
    public int StockId { get; set; }
    public string? StockName { get; set; }
    public string MaterialName { get; set; } = string.Empty;
    public string MaterialType { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal? DeliveredQuantity { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal? NegotiatedPrice { get; set; }
    public decimal? AppliedDiscountPercent { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for inventory order event
/// </summary>
public class InventoryOrderEventDto
{
    public int Id { get; set; }
    public int EventType { get; set; }
    public string EventTypeName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? TriggeredByUserId { get; set; }
    public string? TriggeredByUserName { get; set; }
    public string? PreviousStatus { get; set; }
    public string? NewStatus { get; set; }
    public DateTime EventDate { get; set; }
}

/// <summary>
/// DTO for updating order status
/// </summary>
public class UpdateOrderStatusRequest
{
    public int Status { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for recording delivery
/// </summary>
public class RecordDeliveryRequest
{
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public string VehicleNumber { get; set; } = string.Empty;
    public List<OrderItemDeliveryRequest> DeliveredItems { get; set; } = new();
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for delivered item
/// </summary>
public class OrderItemDeliveryRequest
{
    public int OrderItemId { get; set; }
    public decimal DeliveredQuantity { get; set; }
}

/// <summary>
/// DTO for recording payment
/// </summary>
public class RecordPaymentRequest
{
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for payment history response
/// </summary>
public class PaymentHistoryDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public DateTime PaymentDate { get; set; }
    public int? RecordedByUserId { get; set; }
    public string? RecordedByUserName { get; set; }
    public bool IsPartialPayment { get; set; }
}

/// <summary>
/// DTO for creating recurring order
/// </summary>
public class CreateRecurringOrderRequest
{
    public int SupplierUserId { get; set; }
    public int? WarehouseId { get; set; }
    public int? ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Frequency { get; set; }
    public int Interval { get; set; } = 1;
    public int? DayOfWeek { get; set; }
    public int? DayOfMonth { get; set; }
    public DateTime NextOrderDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? MaxOrders { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? DeliveryNotes { get; set; }
    public List<CreateRecurringOrderItemRequest> Items { get; set; } = new();
}

/// <summary>
/// DTO for recurring order item
/// </summary>
public class CreateRecurringOrderItemRequest
{
    public int StockId { get; set; }
    public decimal Quantity { get; set; }
    public bool ApplyBulkDiscount { get; set; } = true;
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for recurring order response
/// </summary>
public class RecurringOrderDto
{
    public int Id { get; set; }
    public int CustomerUserId { get; set; }
    public string? CustomerUserName { get; set; }
    public int SupplierUserId { get; set; }
    public string? SupplierUserName { get; set; }
    public int? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public int? ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public int Frequency { get; set; }
    public string FrequencyName { get; set; } = string.Empty;
    public int Interval { get; set; }
    public DateTime NextOrderDate { get; set; }
    public DateTime? LastOrderDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int TotalOrdersGenerated { get; set; }
    public int? MaxOrders { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? DeliveryNotes { get; set; }
    public decimal? EstimatedOrderTotal { get; set; }
    public List<RecurringOrderItemDto>? Items { get; set; }
}

/// <summary>
/// DTO for recurring order item response
/// </summary>
public class RecurringOrderItemDto
{
    public int Id { get; set; }
    public int StockId { get; set; }
    public string? StockName { get; set; }
    public string MaterialName { get; set; } = string.Empty;
    public string MaterialType { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal PricePerUnit { get; set; }
    public bool ApplyBulkDiscount { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for calculating price before order
/// </summary>
public class CalculatePriceRequest
{
    public int? SupplierUserId { get; set; }
    public string? AppliedDiscountCode { get; set; }
    public List<CalculatePriceItemRequest> Items { get; set; } = new();
}

/// <summary>
/// DTO for calculating price item
/// </summary>
public class CalculatePriceItemRequest
{
    public int StockId { get; set; }
    public decimal Quantity { get; set; }
}

/// <summary>
/// DTO for price calculation response
/// </summary>
public class CalculatePriceResponse
{
    public List<CalculatedItemResponse> Items { get; set; } = new();
    public decimal SubTotal { get; set; }
    public decimal BulkDiscount { get; set; }
    public decimal LoyaltyDiscount { get; set; }
    public decimal PromoDiscount { get; set; }
    public decimal TotalDiscount { get; set; }
    public decimal Total { get; set; }
    public string? AppliedPromoCode { get; set; }
    public string? LoyaltyTier { get; set; }
    public decimal LoyaltyDiscountPercent { get; set; }
}

/// <summary>
/// DTO for calculated item response
/// </summary>
public class CalculatedItemResponse
{
    public int StockId { get; set; }
    public string MaterialName { get; set; } = string.Empty;
    public string MaterialType { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal? NegotiatedPrice { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal AppliedDiscountPercent { get; set; }
    public decimal TotalPrice { get; set; }
    public string? AppliedTierName { get; set; }
}
