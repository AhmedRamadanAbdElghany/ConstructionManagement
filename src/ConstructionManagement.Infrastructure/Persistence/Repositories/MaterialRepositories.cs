using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories;

public class MaterialRepository : Repository<Material>, IMaterialRepository
{
    private readonly ApplicationDbContext _context;

    public MaterialRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Material>> GetMaterialsByCategoryAsync(int categoryId)
    {
        return await _context.Materials
            .Where(m => m.CategoryId == categoryId && m.IsActive)
            .Include(m => m.Category)
            .Include(m => m.Stocks)
            .ToListAsync();
    }

    public async Task<IEnumerable<Material>> SearchMaterialsAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return new List<Material>();

        searchTerm = searchTerm.ToLower();
        return await _context.Materials
            .Where(m => (m.Name.ToLower().Contains(searchTerm) || 
                         (m.SKU != null && m.SKU.ToLower().Contains(searchTerm)) || 
                         (m.Barcode != null && m.Barcode.Contains(searchTerm)) ||
                         (m.Description != null && m.Description.ToLower().Contains(searchTerm))) && m.IsActive)
            .Include(m => m.Category)
            .ToListAsync();
    }

    public async Task<IEnumerable<Material>> GetLowStockMaterialsAsync()
    {
        // This requires evaluating the sum of stocks vs min level.
        // It's better to do this in memory for complex logic or via projection if possible.
        // Simplified: Material has MinStockLevel. Need to check total stock.
        var materials = await _context.Materials
            .Where(m => m.IsActive && m.IsTracked)
            .Include(m => m.Stocks)
            .ToListAsync();
            
        return materials.Where(m => m.Stocks.Sum(s => s.AvailableQuantity) <= m.MinStockLevel).ToList();
    }

    public async Task<Material?> GetMaterialBySKUAsync(string sku)
    {
        return await _context.Materials
            .Include(m => m.Category)
            .Include(m => m.Stocks)
            .FirstOrDefaultAsync(m => m.SKU == sku);
    }

    public async Task<Material?> GetMaterialByBarcodeAsync(string barcode)
    {
        return await _context.Materials
            .Include(m => m.Category)
            .Include(m => m.Stocks)
            .FirstOrDefaultAsync(m => m.Barcode == barcode);
    }

    public async Task<decimal> GetTotalStockQuantityAsync(int materialId)
    {
        return await _context.MaterialStocks
            .Where(s => s.MaterialId == materialId)
            .SumAsync(s => s.CurrentQuantity); // Or AvailableQuantity depending on requirement. Usually total physical stock.
    }

    public async Task UpdateAverageCostAsync(int materialId)
    {
        var material = await _context.Materials
            .Include(m => m.Stocks)
            .FirstOrDefaultAsync(m => m.Id == materialId);
            
        if (material == null || !material.Stocks.Any())
            return;
            
        var totalQuantity = material.Stocks.Sum(s => s.CurrentQuantity);
        if (totalQuantity == 0) return;
        
        var totalValue = material.Stocks.Sum(s => s.CurrentQuantity * (s.UnitCost ?? 0));
        
        material.AverageCost = totalValue / totalQuantity;
        _context.Materials.Update(material);
        await _context.SaveChangesAsync();
    }
}

public class MaterialCategoryRepository : Repository<MaterialCategory>, IMaterialCategoryRepository
{
    private readonly ApplicationDbContext _context;

    public MaterialCategoryRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MaterialCategory>> GetRootCategoriesAsync()
    {
        return await _context.MaterialCategories
            .Where(c => c.ParentCategoryId == null && !c.IsDeleted)
            .Include(c => c.SubCategories)
            .ToListAsync();
    }

    public async Task<IEnumerable<MaterialCategory>> GetSubCategoriesAsync(int parentId)
    {
        return await _context.MaterialCategories
            .Where(c => c.ParentCategoryId == parentId && !c.IsDeleted)
            .Include(c => c.SubCategories)
            .ToListAsync();
    }

    public async Task<int> GetMaterialCountAsync(int categoryId)
    {
        return await _context.Materials
            .CountAsync(m => m.CategoryId == categoryId && m.IsActive);
    }
}

public class MaterialStockRepository : Repository<MaterialStock>, IMaterialStockRepository
{
    private readonly ApplicationDbContext _context;

    public MaterialStockRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }
    
    public async Task<IEnumerable<MaterialStock>> GetStocksByMaterialAsync(int materialId)
    {
        return await _context.MaterialStocks
            .Where(s => s.MaterialId == materialId)
            .Include(s => s.Material)
            .ToListAsync();
    }

    public async Task<IEnumerable<MaterialStock>> GetStocksByWarehouseAsync(string warehouseId)
    {
        return await _context.MaterialStocks
            .Where(s => s.WarehouseId == warehouseId)
            .Include(s => s.Material)
            .ToListAsync();
    }

    public async Task<MaterialStock?> GetStockByMaterialAndWarehouseAsync(int materialId, string warehouseId)
    {
        return await _context.MaterialStocks
            .FirstOrDefaultAsync(s => s.MaterialId == materialId && s.WarehouseId == warehouseId);
    }
    
    public async Task<MaterialStock?> GetStockByIdAsync(int id)
    {
        return await _context.MaterialStocks
            .Include(s => s.Material)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<decimal> GetTotalAvailableQuantityAsync(int materialId)
    {
        var stocks = await _context.MaterialStocks
            .Where(s => s.MaterialId == materialId)
            .ToListAsync();
            
        return stocks.Sum(s => s.AvailableQuantity);
    }

    public async Task<IEnumerable<MaterialStock>> GetExpiringStockAsync(DateTime expirationDate)
    {
        return await _context.MaterialStocks
            .Where(s => s.ExpirationDate != null && s.ExpirationDate <= expirationDate && s.CurrentQuantity > 0)
            .Include(s => s.Material)
            .ToListAsync();
    }
}

public class MaterialRequestRepository : Repository<MaterialRequest>, IMaterialRequestRepository
{
    private readonly ApplicationDbContext _context;

    public MaterialRequestRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<MaterialRequest?> GetRequestByIdAsync(int id)
    {
        return await _context.MaterialRequests
            .Include(r => r.Items)
                .ThenInclude(i => i.Material)
            .Include(r => r.RequestedByUser)
            .Include(r => r.Project)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<MaterialRequest>> GetRequestsByProjectAsync(int projectId)
    {
        return await _context.MaterialRequests
            .Where(r => r.ProjectId == projectId)
            .Include(r => r.Items)
            .Include(r => r.RequestedByUser)
            .OrderByDescending(r => r.RequestDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<MaterialRequest>> GetRequestsByStatusAsync(string status)
    {
        return await _context.MaterialRequests
            .Where(r => r.Status == status)
            .Include(r => r.Items)
            .Include(r => r.Project)
            .Include(r => r.RequestedByUser)
            .OrderByDescending(r => r.RequestDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<MaterialRequest>> GetRequestsByUserAsync(int userId)
    {
        return await _context.MaterialRequests
            .Where(r => r.RequestedByUserId == userId)
            .Include(r => r.Project)
            .OrderByDescending(r => r.RequestDate)
            .ToListAsync();
    }

    public async Task<string> GenerateRequestNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        // Simple generation: Count + 1. Not concurrency safe but sufficient for now.
        var count = await _context.MaterialRequests.CountAsync(r => r.RequestDate.Year == year);
        return $"MR-{year}-{(count + 1):D4}";
    }

    public async Task<MaterialRequest> AddRequestWithItemsAsync(MaterialRequest request, IEnumerable<MaterialRequestItem> items)
    {
        // Use a transaction ideally
        await _context.MaterialRequests.AddAsync(request);
        await _context.SaveChangesAsync(); // To get ID

        foreach (var item in items)
        {
            item.MaterialRequestId = request.Id;
            await _context.MaterialRequestItems.AddAsync(item);
        }
        await _context.SaveChangesAsync();
        
        return request;
    }

    public async Task<MaterialRequest> UpdateRequestWithItemsAsync(MaterialRequest request, IEnumerable<MaterialRequestItem> items)
    {
        _context.MaterialRequests.Update(request);
        
        // Remove existing items? Or update? Logic depends on usage. 
        // Assuming replace pattern for simplicity as per common request logic
        var existingItems = await _context.MaterialRequestItems.Where(i => i.MaterialRequestId == request.Id).ToListAsync();
        _context.MaterialRequestItems.RemoveRange(existingItems);
        
        foreach (var item in items)
        {
            item.MaterialRequestId = request.Id;
            await _context.MaterialRequestItems.AddAsync(item);
        }
        
        await _context.SaveChangesAsync();
        return request;
    }
}

public class MaterialRequestItemRepository : Repository<MaterialRequestItem>, IMaterialRequestItemRepository
{
    private readonly ApplicationDbContext _context;

    public MaterialRequestItemRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MaterialRequestItem>> GetItemsByRequestAsync(int requestId)
    {
        return await _context.MaterialRequestItems
            .Where(i => i.MaterialRequestId == requestId)
            .Include(i => i.Material)
            .ToListAsync();
    }
}

public class MaterialConsumptionRepository : Repository<MaterialConsumption>, IMaterialConsumptionRepository
{
    private readonly ApplicationDbContext _context;

    public MaterialConsumptionRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MaterialConsumption>> GetConsumptionsByProjectAsync(int projectId)
    {
        return await _context.MaterialConsumptions
            .Where(c => c.ProjectId == projectId)
            .Include(c => c.Material)
            .Include(c => c.RecordedByUser)
            .OrderByDescending(c => c.ConsumptionDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<MaterialConsumption>> GetConsumptionsByMaterialAsync(int materialId)
    {
        return await _context.MaterialConsumptions
            .Where(c => c.MaterialId == materialId)
            .Include(c => c.Project)
            .Include(c => c.RecordedByUser)
            .OrderByDescending(c => c.ConsumptionDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<MaterialConsumption>> GetConsumptionsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.MaterialConsumptions
            .Where(c => c.ConsumptionDate >= startDate && c.ConsumptionDate <= endDate)
            .Include(c => c.Material)
            .Include(c => c.Project)
            .OrderByDescending(c => c.ConsumptionDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<MaterialConsumption>> GetConsumptionsByDailyLogAsync(int dailyLogId)
    {
         return await _context.MaterialConsumptions
            .Where(c => c.ItemDailyLogId == dailyLogId)
            .Include(c => c.Material)
            .ToListAsync();
    }

    public async Task<decimal> GetTotalConsumedQuantityAsync(int materialId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.MaterialConsumptions
            .Where(c => c.MaterialId == materialId);
            
        if (startDate.HasValue)
            query = query.Where(c => c.ConsumptionDate >= startDate.Value);
            
        if (endDate.HasValue)
            query = query.Where(c => c.ConsumptionDate <= endDate.Value);
            
        return await query.SumAsync(c => c.Quantity);
    }
}

public class WarehouseRepository : Repository<Warehouse>, IWarehouseRepository
{
    private readonly ApplicationDbContext _context;

    public WarehouseRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<Warehouse?> GetWarehouseByCodeAsync(string code)
    {
        return await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Code == code);
    }

    public async Task<Warehouse?> GetDefaultWarehouseAsync()
    {
        return await _context.Warehouses
            .FirstOrDefaultAsync(w => w.IsDefault && w.IsActive);
    }

    public async Task<IEnumerable<Warehouse>> GetActiveWarehousesAsync()
    {
        return await _context.Warehouses
            .Where(w => w.IsActive)
            .ToListAsync();
    }
}
