using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

/// <summary>
/// Repository interface for Material operations
/// </summary>
public interface IMaterialRepository : IRepository<Material>
{
    Task<IEnumerable<Material>> GetMaterialsByCategoryAsync(int categoryId);
    Task<IEnumerable<Material>> SearchMaterialsAsync(string searchTerm);
    Task<IEnumerable<Material>> GetLowStockMaterialsAsync();
    Task<Material?> GetMaterialBySKUAsync(string sku);
    Task<Material?> GetMaterialByBarcodeAsync(string barcode);
    Task<decimal> GetTotalStockQuantityAsync(int materialId);
    Task UpdateAverageCostAsync(int materialId);
}

/// <summary>
/// Repository interface for Material Category operations
/// </summary>
public interface IMaterialCategoryRepository : IRepository<MaterialCategory>
{
    Task<IEnumerable<MaterialCategory>> GetRootCategoriesAsync();
    Task<IEnumerable<MaterialCategory>> GetSubCategoriesAsync(int parentId);
    Task<int> GetMaterialCountAsync(int categoryId);
}

/// <summary>
/// Repository interface for Material Stock operations
/// </summary>
public interface IMaterialStockRepository : IRepository<MaterialStock>
{
    Task<IEnumerable<MaterialStock>> GetStocksByMaterialAsync(int materialId);
    Task<IEnumerable<MaterialStock>> GetStocksByWarehouseAsync(string warehouseId);
    Task<MaterialStock?> GetStockByMaterialAndWarehouseAsync(int materialId, string warehouseId);
    Task<MaterialStock?> GetStockByIdAsync(int id);
    Task<decimal> GetTotalAvailableQuantityAsync(int materialId);
    Task<IEnumerable<MaterialStock>> GetExpiringStockAsync(DateTime expirationDate);
}

/// <summary>
/// Repository interface for Material Request operations
/// </summary>
public interface IMaterialRequestRepository : IRepository<MaterialRequest>
{
    Task<MaterialRequest?> GetRequestByIdAsync(int id);
    Task<IEnumerable<MaterialRequest>> GetRequestsByProjectAsync(int projectId);
    Task<IEnumerable<MaterialRequest>> GetRequestsByStatusAsync(string status);
    Task<IEnumerable<MaterialRequest>> GetRequestsByUserAsync(int userId);
    Task<string> GenerateRequestNumberAsync();
    Task<MaterialRequest> AddRequestWithItemsAsync(MaterialRequest request, IEnumerable<MaterialRequestItem> items);
    Task<MaterialRequest> UpdateRequestWithItemsAsync(MaterialRequest request, IEnumerable<MaterialRequestItem> items);
}

/// <summary>
/// Repository interface for Material Request Item operations
/// </summary>
public interface IMaterialRequestItemRepository : IRepository<MaterialRequestItem>
{
    Task<IEnumerable<MaterialRequestItem>> GetItemsByRequestAsync(int requestId);
}

/// <summary>
/// Repository interface for Material Consumption operations
/// </summary>
public interface IMaterialConsumptionRepository : IRepository<MaterialConsumption>
{
    Task<IEnumerable<MaterialConsumption>> GetConsumptionsByProjectAsync(int projectId);
    Task<IEnumerable<MaterialConsumption>> GetConsumptionsByMaterialAsync(int materialId);
    Task<IEnumerable<MaterialConsumption>> GetConsumptionsByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<MaterialConsumption>> GetConsumptionsByDailyLogAsync(int dailyLogId);
    Task<decimal> GetTotalConsumedQuantityAsync(int materialId, DateTime? startDate = null, DateTime? endDate = null);
}

/// <summary>
/// Repository interface for Warehouse operations
/// </summary>
public interface IWarehouseRepository : IRepository<Warehouse>
{
    Task<Warehouse?> GetWarehouseByCodeAsync(string code);
    Task<Warehouse?> GetDefaultWarehouseAsync();
    Task<IEnumerable<Warehouse>> GetActiveWarehousesAsync();
}
