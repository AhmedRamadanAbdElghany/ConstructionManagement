using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Interface for Material management services
/// </summary>
public interface IMaterialService
{
    Task<IReadOnlyList<Material>> GetMaterialsAsync(int? companyId = null);
    Task<Material?> GetMaterialByIdAsync(int id);
    Task<Material> CreateMaterialAsync(Material material);
    Task<Material> UpdateMaterialAsync(Material material);
    Task<bool> DeleteMaterialAsync(int id);
    Task<IReadOnlyList<Material>> SearchMaterialsAsync(string searchTerm, int? companyId = null);
    Task<IReadOnlyList<Material>> GetLowStockMaterialsAsync(int? companyId = null);
}

/// <summary>
/// Interface for Material Category services
/// </summary>
public interface IMaterialCategoryService
{
    Task<IReadOnlyList<MaterialCategory>> GetCategoriesAsync(int? companyId = null);
    Task<MaterialCategory?> GetCategoryByIdAsync(int id);
    Task<MaterialCategory> CreateCategoryAsync(MaterialCategory category);
    Task<MaterialCategory> UpdateCategoryAsync(MaterialCategory category);
    Task<bool> DeleteCategoryAsync(int id);
    Task<IReadOnlyList<MaterialCategory>> GetCategoryTreeAsync(int? companyId = null);
}

/// <summary>
/// Interface for Material Stock services
/// </summary>
public interface IMaterialStockService
{
    Task<IReadOnlyList<MaterialStock>> GetStocksAsync(int? companyId = null);
    Task<MaterialStock?> GetStockByIdAsync(int id);
    Task<IReadOnlyList<MaterialStock>> GetStocksByMaterialAsync(int materialId);
    Task<IReadOnlyList<MaterialStock>> GetStocksByWarehouseAsync(string warehouseId);
    Task<MaterialStock> UpdateStockAsync(MaterialStock stock);
    Task<MaterialStock> AdjustStockAsync(int materialId, string warehouseId, decimal quantity, string transactionType, string? notes = null);
    Task<bool> CheckAvailabilityAsync(int materialId, string warehouseId, decimal quantity);
}

/// <summary>
/// Interface for Material Request services
/// </summary>
public interface IMaterialRequestService
{
    Task<IReadOnlyList<MaterialRequest>> GetRequestsAsync(int? companyId = null);
    Task<MaterialRequest?> GetRequestByIdAsync(int id);
    Task<MaterialRequest> CreateRequestAsync(MaterialRequest request);
    Task<MaterialRequest> UpdateRequestAsync(MaterialRequest request);
    Task<MaterialRequest> ApproveRequestAsync(int requestId, int approvedByUserId);
    Task<MaterialRequest> RejectRequestAsync(int requestId, string reason, int rejectedByUserId);
    Task<MaterialRequest> FulfillRequestAsync(int requestId, int fulfilledByUserId);
    Task<MaterialRequest> CancelRequestAsync(int requestId, int cancelledByUserId);
    Task<IReadOnlyList<MaterialRequest>> GetRequestsByProjectAsync(int projectId);
    Task<IReadOnlyList<MaterialRequest>> GetRequestsByStatusAsync(string status);
}

/// <summary>
/// Interface for Material Consumption services
/// </summary>
public interface IMaterialConsumptionService
{
    Task<IReadOnlyList<MaterialConsumption>> GetConsumptionsAsync(int? companyId = null);
    Task<MaterialConsumption?> GetConsumptionByIdAsync(int id);
    Task<MaterialConsumption> CreateConsumptionAsync(MaterialConsumption consumption);
    Task<bool> DeleteConsumptionAsync(int id);
    Task<IReadOnlyList<MaterialConsumption>> GetConsumptionsByProjectAsync(int projectId);
    Task<IReadOnlyList<MaterialConsumption>> GetConsumptionsByMaterialAsync(int materialId);
    Task<IReadOnlyList<MaterialConsumption>> GetConsumptionsByDateRangeAsync(DateTime startDate, DateTime endDate, int? companyId = null);
}

/// <summary>
/// Interface for Warehouse services
/// </summary>
public interface IWarehouseService
{
    Task<IReadOnlyList<Warehouse>> GetWarehousesAsync(int? companyId = null);
    Task<Warehouse?> GetWarehouseByIdAsync(int id);
    Task<Warehouse> CreateWarehouseAsync(Warehouse warehouse);
    Task<Warehouse> UpdateWarehouseAsync(Warehouse warehouse);
    Task<bool> DeleteWarehouseAsync(int id);
    Task<Warehouse?> GetDefaultWarehouseAsync(int? companyId = null);
    Task<Warehouse?> GetWarehouseByCodeAsync(string code);
}

// ── Inventory Order System Interfaces ─────────────────────────────────────

/// <summary>
/// Interface for Inventory Warehouse (Owned by Inventory Owner) services
/// </summary>
public interface IInventoryWarehouseService
{
    Task<IReadOnlyList<InventoryWarehouse>> GetWarehousesByOwnerAsync(int ownerUserId);
    Task<InventoryWarehouse?> GetWarehouseByIdAsync(int id);
    Task<InventoryWarehouse> CreateWarehouseAsync(InventoryWarehouse warehouse);
    Task<InventoryWarehouse> UpdateWarehouseAsync(InventoryWarehouse warehouse);
    Task<bool> DeleteWarehouseAsync(int id);
    Task<InventoryWarehouse?> GetWarehouseByIdAndOwnerAsync(int id, int ownerUserId);
    Task<IReadOnlyList<InventoryWarehouse>> GetApprovedWarehousesAsync();
    Task<InventoryWarehouse> ApproveWarehouseAsync(int warehouseId);
}

/// <summary>
/// Interface for Inventory Stock services
/// </summary>
public interface IInventoryStockService
{
    Task<IReadOnlyList<InventoryStock>> GetStocksByWarehouseAsync(int warehouseId);
    Task<InventoryStock?> GetStockByIdAsync(int id);
    Task<InventoryStock> CreateStockAsync(InventoryStock stock);
    Task<InventoryStock> UpdateStockAsync(InventoryStock stock);
    Task<bool> DeleteStockAsync(int id);
    Task<InventoryStock?> GetStockByIdAndWarehouseAsync(int id, int warehouseId);
    Task<IReadOnlyList<InventoryStock>> SearchStocksByMaterialTypeAsync(string materialType);
    Task<IReadOnlyList<InventoryStock>> GetAvailableStocksByTypeAsync(string materialType);
}

/// <summary>
/// Interface for Stock Discount Tier services
/// </summary>
public interface IStockDiscountTierService
{
    Task<IReadOnlyList<StockDiscountTier>> GetTiersByStockAsync(int stockId);
    Task<StockDiscountTier?> GetTierByIdAsync(int id);
    Task<StockDiscountTier> CreateTierAsync(StockDiscountTier tier);
    Task<StockDiscountTier> UpdateTierAsync(StockDiscountTier tier);
    Task<bool> DeleteTierAsync(int id);
    Task<StockDiscountTier?> GetApplicableTierAsync(int stockId, decimal quantity);
}

/// <summary>
/// Interface for Customer Tier Discount services
/// </summary>
public interface ICustomerTierDiscountService
{
    Task<IReadOnlyList<CustomerTierDiscount>> GetDiscountsByCustomerAsync(int customerUserId);
    Task<IReadOnlyList<CustomerTierDiscount>> GetDiscountsBySupplierAsync(int supplierUserId);
    Task<CustomerTierDiscount?> GetDiscountByCustomerAndSupplierAsync(int customerUserId, int supplierUserId);
    Task<CustomerTierDiscount> CreateOrUpdateDiscountAsync(CustomerTierDiscount discount);
    Task<CustomerTierDiscount> UpgradeTierAsync(int customerUserId, int supplierUserId, int newTier);
    Task<CustomerTierDiscount> CalculateAndApplyLoyaltyDiscountAsync(int customerUserId, int supplierUserId, decimal orderTotal);
}

/// <summary>
/// Interface for Special Promotion services
/// </summary>
public interface ISpecialPromotionService
{
    Task<IReadOnlyList<SpecialPromotion>> GetPromotionsBySupplierAsync(int supplierUserId);
    Task<SpecialPromotion?> GetPromotionByIdAsync(int id);
    Task<SpecialPromotion?> GetPromotionByCodeAsync(string discountCode);
    Task<SpecialPromotion> CreatePromotionAsync(SpecialPromotion promotion);
    Task<SpecialPromotion> UpdatePromotionAsync(SpecialPromotion promotion);
    Task<bool> DeletePromotionAsync(int id);
    Task<DiscountValidationResponse> ValidateAndApplyPromoCodeAsync(ValidateDiscountRequest request, int customerUserId);
    Task<SpecialPromotion> IncrementUsageCountAsync(int promotionId);
}

/// <summary>
/// Interface for Inventory Order services
/// </summary>
public interface IInventoryOrderService
{
    Task<IReadOnlyList<InventoryOrder>> GetOrdersByCustomerAsync(int customerUserId);
    Task<IReadOnlyList<InventoryOrder>> GetOrdersBySupplierAsync(int supplierUserId);
    Task<IReadOnlyList<InventoryOrder>> GetOrdersByStatusAsync(int supplierUserId, int status);
    Task<InventoryOrder?> GetOrderByIdAsync(int id);
    Task<InventoryOrder?> GetOrderByIdAndCustomerAsync(int id, int customerUserId);
    Task<InventoryOrder?> GetOrderByIdAndSupplierAsync(int id, int supplierUserId);
    Task<InventoryOrder> CreateOrderAsync(CreateInventoryOrderRequest request, int customerUserId);
    Task<InventoryOrder> UpdateOrderAsync(InventoryOrder order);
    Task<InventoryOrder> UpdateOrderStatusAsync(int orderId, int newStatus, int? changedByUserId);
    Task<InventoryOrder> AcceptOrderAsync(int orderId, int supplierUserId);
    Task<InventoryOrder> RejectOrderAsync(int orderId, int supplierUserId, string reason);
    Task<InventoryOrder> StartProcessingOrderAsync(int orderId);
    Task<InventoryOrder> MarkAsReadyForDeliveryAsync(int orderId);
    Task<InventoryOrder> RecordDeliveryAsync(int orderId, RecordDeliveryRequest request);
    Task<InventoryOrder> CancelOrderAsync(int orderId, int cancelledByUserId, string? reason);
    Task<CalculatePriceResponse> CalculatePriceAsync(CalculatePriceRequest request, int? customerUserId);
}

/// <summary>
/// Interface for Inventory Order Item services
/// </summary>
public interface IInventoryOrderItemService
{
    Task<IReadOnlyList<InventoryOrderItem>> GetItemsByOrderAsync(int orderId);
    Task<InventoryOrderItem?> GetItemByIdAsync(int id);
    Task<InventoryOrderItem> CreateItemAsync(InventoryOrderItem item);
    Task<InventoryOrderItem> UpdateItemAsync(InventoryOrderItem item);
}

/// <summary>
/// Interface for Inventory Order Event services
/// </summary>
public interface IInventoryOrderEventService
{
    Task<IReadOnlyList<InventoryOrderEvent>> GetEventsByOrderAsync(int orderId);
    Task<InventoryOrderEvent> CreateEventAsync(InventoryOrderEvent orderEvent);
}

/// <summary>
/// Interface for Payment History services
/// </summary>
public interface IPaymentHistoryService
{
    Task<IReadOnlyList<PaymentHistory>> GetPaymentsByOrderAsync(int orderId);
    Task<PaymentHistory?> GetPaymentByIdAsync(int id);
    Task<PaymentHistory> RecordPaymentAsync(int orderId, RecordPaymentRequest request, int recordedByUserId);
    Task<decimal> GetTotalPaidAmountAsync(int orderId);
}

/// <summary>
/// Interface for Recurring Order services
/// </summary>
public interface IRecurringOrderService
{
    Task<IReadOnlyList<RecurringOrder>> GetRecurringOrdersByCustomerAsync(int customerUserId);
    Task<IReadOnlyList<RecurringOrder>> GetRecurringOrdersBySupplierAsync(int supplierUserId);
    Task<RecurringOrder?> GetRecurringOrderByIdAsync(int id);
    Task<RecurringOrder> CreateRecurringOrderAsync(CreateRecurringOrderRequest request, int customerUserId);
    Task<RecurringOrder> UpdateRecurringOrderAsync(RecurringOrder order);
    Task<RecurringOrder> PauseRecurringOrderAsync(int orderId);
    Task<RecurringOrder> ResumeRecurringOrderAsync(int orderId);
    Task<bool> DeleteRecurringOrderAsync(int id);
    Task<RecurringOrder> GenerateNextOrderAsync(int recurringOrderId);
}
