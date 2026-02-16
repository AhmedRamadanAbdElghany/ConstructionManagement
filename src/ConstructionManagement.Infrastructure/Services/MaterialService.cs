using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Exceptions;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Implementation of Material service
/// </summary>
public class MaterialService : IMaterialService
{
    private readonly IMaterialRepository _materialRepository;
    private readonly IRepository<CompanyFeatureSettings> _featureSettingsRepository;
    private readonly IRepository<CompanySettings> _settingsRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MaterialService> _logger;

    public MaterialService(
        IMaterialRepository materialRepository,
        IRepository<CompanyFeatureSettings> featureSettingsRepository,
        IRepository<CompanySettings> settingsRepository,
        IUnitOfWork unitOfWork,
        ILogger<MaterialService> logger)
    {
        _materialRepository = materialRepository;
        _featureSettingsRepository = featureSettingsRepository;
        _settingsRepository = settingsRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    private async Task CheckFeatureEnabledAsync(int? companyId)
    {
        if (!companyId.HasValue) return;
        
        var featureSettings = await _featureSettingsRepository.AsQueryable()
            .FirstOrDefaultAsync(s => s.CompanyId == companyId.Value);
        
        // If no feature settings exist, assume disabled
        if (featureSettings == null || !featureSettings.EnableInventoryManagement)
        {
            throw new FeatureNotEnabledException("Inventory Management", companyId.Value);
        }
    }

    public async Task<IReadOnlyList<Material>> GetMaterialsAsync(int? companyId = null)
    {
        await CheckFeatureEnabledAsync(companyId);
        var materials = await _materialRepository.GetAllAsync();
        if (companyId.HasValue)
        {
            materials = materials.Where(m => m.CompanyId == companyId.Value).ToList();
        }
        return materials;
    }

    public async Task<Material?> GetMaterialByIdAsync(int id)
    {
        return await _materialRepository.GetByIdAsync(id);
    }

    public async Task<Material> CreateMaterialAsync(Material material)
    {
        await CheckFeatureEnabledAsync(material.CompanyId);
        await _materialRepository.AddAsync(material);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Created material {MaterialId} - {MaterialName}", material.Id, material.Name);
        return material;
    }

    public async Task<Material> UpdateMaterialAsync(Material material)
    {
        await CheckFeatureEnabledAsync(material.CompanyId);
        material.UpdatedAt = DateTime.UtcNow;
        await _materialRepository.UpdateAsync(material);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Updated material {MaterialId}", material.Id);
        return material;
    }

    public async Task<bool> DeleteMaterialAsync(int id)
    {
        var material = await _materialRepository.GetByIdAsync(id);
        if (material == null) return false;

        await CheckFeatureEnabledAsync(material.CompanyId);
        await _materialRepository.DeleteAsync(material);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Deleted material {MaterialId}", id);
        return true;
    }

    public async Task<IReadOnlyList<Material>> SearchMaterialsAsync(string searchTerm, int? companyId = null)
    {
        await CheckFeatureEnabledAsync(companyId);
        var materials = await _materialRepository.SearchMaterialsAsync(searchTerm);
        if (companyId.HasValue)
        {
            materials = materials.Where(m => m.CompanyId == companyId.Value).ToList();
        }
        return materials.ToList();
    }

    public async Task<IReadOnlyList<Material>> GetLowStockMaterialsAsync(int? companyId = null)
    {
        await CheckFeatureEnabledAsync(companyId);
        var materials = await _materialRepository.GetLowStockMaterialsAsync();
        if (companyId.HasValue)
        {
            materials = materials.Where(m => m.CompanyId == companyId.Value).ToList();
        }
        return materials.ToList();
    }
}

/// <summary>
/// Implementation of Material Category service
/// </summary>
public class MaterialCategoryService : IMaterialCategoryService
{
    private readonly IMaterialCategoryRepository _categoryRepository;
    private readonly IRepository<CompanyFeatureSettings> _featureSettingsRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MaterialCategoryService> _logger;

    public MaterialCategoryService(
        IMaterialCategoryRepository categoryRepository,
        IRepository<CompanyFeatureSettings> featureSettingsRepository,
        IUnitOfWork unitOfWork,
        ILogger<MaterialCategoryService> logger)
    {
        _categoryRepository = categoryRepository;
        _featureSettingsRepository = featureSettingsRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    private async Task CheckFeatureEnabledAsync(int? companyId)
    {
        if (!companyId.HasValue) return;
        
        var featureSettings = await _featureSettingsRepository.AsQueryable()
            .FirstOrDefaultAsync(s => s.CompanyId == companyId.Value);
        
        if (featureSettings == null || !featureSettings.EnableInventoryManagement)
        {
            throw new FeatureNotEnabledException("Inventory Management", companyId.Value);
        }
    }

    public async Task<IReadOnlyList<MaterialCategory>> GetCategoriesAsync(int? companyId = null)
    {
        await CheckFeatureEnabledAsync(companyId);
        var categories = await _categoryRepository.GetAllAsync();
        return categories.ToList();
    }

    public async Task<MaterialCategory?> GetCategoryByIdAsync(int id)
    {
        return await _categoryRepository.GetByIdAsync(id);
    }

    public async Task<MaterialCategory> CreateCategoryAsync(MaterialCategory category)
    {
        // MaterialCategory doesn't have CompanyId - feature check is done at entity level
        await _categoryRepository.AddAsync(category);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Created category {CategoryId} - {CategoryName}", category.Id, category.Name);
        return category;
    }

    public async Task<MaterialCategory> UpdateCategoryAsync(MaterialCategory category)
    {
        // MaterialCategory doesn't have CompanyId - feature check is done at entity level
        category.UpdatedAt = DateTime.UtcNow;
        await _categoryRepository.UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Updated category {CategoryId}", category.Id);
        return category;
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null) return false;

        // MaterialCategory doesn't have CompanyId - feature check is done at entity level
        await _categoryRepository.DeleteAsync(category);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Deleted category {CategoryId}", id);
        return true;
    }

    public async Task<IReadOnlyList<MaterialCategory>> GetCategoryTreeAsync(int? companyId = null)
    {
        await CheckFeatureEnabledAsync(companyId);
        var categories = await GetCategoriesAsync(companyId);
        return categories.Where(c => c.ParentCategoryId == null).ToList();
    }
}

/// <summary>
/// Implementation of Material Stock service
/// </summary>
public class MaterialStockService : IMaterialStockService
{
    private readonly IMaterialStockRepository _stockRepository;
    private readonly IMaterialRepository _materialRepository;
    private readonly IRepository<CompanyFeatureSettings> _featureSettingsRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MaterialStockService> _logger;

    public MaterialStockService(
        IMaterialStockRepository stockRepository,
        IMaterialRepository materialRepository,
        IRepository<CompanyFeatureSettings> featureSettingsRepository,
        IUnitOfWork unitOfWork,
        ILogger<MaterialStockService> logger)
    {
        _stockRepository = stockRepository;
        _materialRepository = materialRepository;
        _featureSettingsRepository = featureSettingsRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    private async Task CheckFeatureEnabledAsync(int? companyId)
    {
        if (!companyId.HasValue) return;
        
        var featureSettings = await _featureSettingsRepository.AsQueryable()
            .FirstOrDefaultAsync(s => s.CompanyId == companyId.Value);
        
        if (featureSettings == null || !featureSettings.EnableInventoryManagement)
        {
            throw new FeatureNotEnabledException("Inventory Management", companyId.Value);
        }
    }

    public async Task<IReadOnlyList<MaterialStock>> GetStocksAsync(int? companyId = null)
    {
        await CheckFeatureEnabledAsync(companyId);
        var stocks = await _stockRepository.GetAllAsync();
        if (companyId.HasValue)
        {
            stocks = stocks.Where(s => s.CompanyId == companyId.Value).ToList();
        }
        return stocks;
    }

    public async Task<MaterialStock?> GetStockByIdAsync(int id)
    {
        return await _stockRepository.GetByIdAsync(id);
    }

    public async Task<IReadOnlyList<MaterialStock>> GetStocksByMaterialAsync(int materialId)
    {
        var stock = await _materialRepository.GetByIdAsync(materialId);
        if (stock != null)
        {
            await CheckFeatureEnabledAsync(stock.CompanyId);
        }
        var stocks = await _stockRepository.GetStocksByMaterialAsync(materialId);
        return stocks.ToList();
    }

    public async Task<IReadOnlyList<MaterialStock>> GetStocksByWarehouseAsync(string warehouseId)
    {
        var stocks = await _stockRepository.GetStocksByWarehouseAsync(warehouseId);
        return stocks.ToList();
    }

    public async Task<MaterialStock> UpdateStockAsync(MaterialStock stock)
    {
        await CheckFeatureEnabledAsync(stock.CompanyId);
        stock.UpdatedAt = DateTime.UtcNow;
        await _stockRepository.UpdateAsync(stock);
        await _unitOfWork.SaveChangesAsync();
        return stock;
    }

    public async Task<MaterialStock> AdjustStockAsync(int materialId, string warehouseId, decimal quantity, string transactionType, string? notes = null)
    {
        var material = await _materialRepository.GetByIdAsync(materialId);
        if (material != null)
        {
            await CheckFeatureEnabledAsync(material.CompanyId);
        }
        
        var stock = await _stockRepository.GetStockByMaterialAndWarehouseAsync(materialId, warehouseId);
        
        if (stock == null)
        {
            stock = new MaterialStock
            {
                MaterialId = materialId,
                WarehouseCode = warehouseId,
                CurrentQuantity = quantity > 0 ? quantity : 0,
                CompanyId = material?.CompanyId
            };
            await _stockRepository.AddAsync(stock);
        }
        else
        {
            // Adjust quantity based on transaction type
            switch (transactionType.ToLower())
            {
                case "purchase":
                case "receipt":
                case "transferin":
                case "return":
                    stock.CurrentQuantity += quantity;
                    break;
                case "transferout":
                case "consumption":
                case "damage":
                case "expiration":
                    stock.CurrentQuantity -= quantity;
                    if (stock.CurrentQuantity < 0) stock.CurrentQuantity = 0;
                    break;
                case "adjustment":
                    stock.CurrentQuantity = quantity;
                    break;
            }
        }

        stock.UpdatedAt = DateTime.UtcNow;
        await _stockRepository.UpdateAsync(stock);
        await _unitOfWork.SaveChangesAsync();
        
        _logger.LogInformation("Adjusted stock for material {MaterialId} in warehouse {WarehouseId}. Type: {Type}, Qty: {Qty}", 
            materialId, warehouseId, transactionType, quantity);
        
        return stock;
    }

    public async Task<bool> CheckAvailabilityAsync(int materialId, string warehouseId, decimal quantity)
    {
        var stock = await _stockRepository.GetStockByMaterialAndWarehouseAsync(materialId, warehouseId);
        if (stock == null) return false;
        return stock.AvailableQuantity >= quantity;
    }
}
