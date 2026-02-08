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
