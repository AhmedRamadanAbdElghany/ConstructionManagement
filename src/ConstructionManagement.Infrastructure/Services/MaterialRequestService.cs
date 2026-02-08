using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Exceptions;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Implementation of Material Request service
/// </summary>
public class MaterialRequestService : IMaterialRequestService
{
    private readonly IMaterialRequestRepository _requestRepository;
    private readonly IMaterialRequestItemRepository _requestItemRepository;
    private readonly IMaterialStockService _stockService;
    private readonly IRepository<CompanyFeatureSettings> _featureSettingsRepository;
    private readonly IRepository<CompanySettings> _settingsRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MaterialRequestService> _logger;

    public MaterialRequestService(
        IMaterialRequestRepository requestRepository,
        IMaterialRequestItemRepository requestItemRepository,
        IMaterialStockService stockService,
        IRepository<CompanyFeatureSettings> featureSettingsRepository,
        IRepository<CompanySettings> settingsRepository,
        IUnitOfWork unitOfWork,
        ILogger<MaterialRequestService> logger)
    {
        _requestRepository = requestRepository;
        _requestItemRepository = requestItemRepository;
        _stockService = stockService;
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
        
        if (featureSettings == null || !featureSettings.EnableInventoryManagement)
        {
            throw new FeatureNotEnabledException("Inventory Management", companyId.Value);
        }
    }

    public async Task<IReadOnlyList<MaterialRequest>> GetRequestsAsync(int? companyId = null)
    {
        await CheckFeatureEnabledAsync(companyId);
        var requests = await _requestRepository.GetAllAsync();
        if (companyId.HasValue)
        {
            requests = requests.Where(r => r.CompanyId == companyId.Value).ToList();
        }
        return requests;
    }

    public async Task<MaterialRequest?> GetRequestByIdAsync(int id)
    {
        return await _requestRepository.GetRequestByIdAsync(id);
    }

    public async Task<MaterialRequest> CreateRequestAsync(MaterialRequest request)
    {
        await CheckFeatureEnabledAsync(request.CompanyId);
        request.RequestNumber = await GenerateRequestNumberAsync();
        request.RequestDate = DateTime.UtcNow;
        request.Status = RequestStatus.Pending.ToString();
        
        // Calculate estimated cost
        decimal totalCost = 0;
        foreach (var item in request.Items)
        {
            if (item.UnitCost.HasValue)
            {
                totalCost += item.UnitCost.Value * item.RequestedQuantity;
            }
        }
        request.EstimatedCost = totalCost;

        await _requestRepository.AddAsync(request);
        await _unitOfWork.SaveChangesAsync();
        
        _logger.LogInformation("Created material request {RequestNumber}", request.RequestNumber);
        return request;
    }

    public async Task<MaterialRequest> UpdateRequestAsync(MaterialRequest request)
    {
        await CheckFeatureEnabledAsync(request.CompanyId);
        request.UpdatedAt = DateTime.UtcNow;
        await _requestRepository.UpdateAsync(request);
        await _unitOfWork.SaveChangesAsync();
        return request;
    }

    public async Task<MaterialRequest> ApproveRequestAsync(int requestId, int approvedByUserId)
    {
        var request = await _requestRepository.GetByIdAsync(requestId);
        if (request == null) throw new InvalidOperationException("Request not found");

        await CheckFeatureEnabledAsync(request.CompanyId);
        request.Status = RequestStatus.Approved.ToString();
        request.ApprovedByUserId = approvedByUserId;
        request.ApprovalDate = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepository.UpdateAsync(request);
        await _unitOfWork.SaveChangesAsync();
        
        _logger.LogInformation("Approved material request {RequestNumber}", request.RequestNumber);
        return request;
    }

    public async Task<MaterialRequest> RejectRequestAsync(int requestId, string reason, int rejectedByUserId)
    {
        var request = await _requestRepository.GetByIdAsync(requestId);
        if (request == null) throw new InvalidOperationException("Request not found");

        await CheckFeatureEnabledAsync(request.CompanyId);
        request.Status = RequestStatus.Rejected.ToString();
        request.RejectionReason = reason;
        // RejectedByUserId doesn't exist - using ApprovedByUserId for compatibility
        request.ApprovedByUserId = rejectedByUserId;
        request.ApprovalDate = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepository.UpdateAsync(request);
        await _unitOfWork.SaveChangesAsync();
        
        _logger.LogInformation("Rejected material request {RequestNumber}. Reason: {Reason}", request.RequestNumber, reason);
        return request;
    }

    public async Task<MaterialRequest> FulfillRequestAsync(int requestId, int fulfilledByUserId)
    {
        var request = await _requestRepository.GetRequestByIdAsync(requestId);
        if (request == null) throw new InvalidOperationException("Request not found");

        await CheckFeatureEnabledAsync(request.CompanyId);
        // Deduct stock for each item
        decimal totalCost = 0;
        foreach (var item in request.Items)
        {
            // Reserve stock first
            var stock = await _stockService.AdjustStockAsync(
                item.MaterialId, 
                request.SourceWarehouse, 
                item.ApprovedQuantity, 
                "reservation",
                $"Reserved for request {request.RequestNumber}");

            // Then consume
            await _stockService.AdjustStockAsync(
                item.MaterialId,
                request.SourceWarehouse,
                item.ApprovedQuantity,
                "consumption",
                $"Fulfilled request {request.RequestNumber}");

            if (item.UnitCost.HasValue)
            {
                totalCost += item.UnitCost.Value * item.FulfilledQuantity;
            }
        }

        // Update request status
        var allFulfilled = request.Items.All(i => i.FulfilledQuantity >= i.ApprovedQuantity);
        request.Status = allFulfilled 
            ? RequestStatus.Fulfilled.ToString() 
            : RequestStatus.PartiallyFulfilled.ToString();
        request.ActualCost = totalCost;
        // Using ApprovedByUserId for fulfilled by for compatibility
        request.ApprovedByUserId = fulfilledByUserId;
        // Using ApprovalDate as fulfillment date for compatibility
        request.ApprovalDate = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepository.UpdateAsync(request);
        await _unitOfWork.SaveChangesAsync();
        
        _logger.LogInformation("Fulfilled material request {RequestNumber}", request.RequestNumber);
        return request;
    }

    public async Task<MaterialRequest> CancelRequestAsync(int requestId, int cancelledByUserId)
    {
        var request = await _requestRepository.GetByIdAsync(requestId);
        if (request == null) throw new InvalidOperationException("Request not found");

        await CheckFeatureEnabledAsync(request.CompanyId);
        if (request.Status == RequestStatus.Fulfilled.ToString() || 
            request.Status == RequestStatus.Cancelled.ToString())
        {
            throw new InvalidOperationException("Cannot cancel a fulfilled or already cancelled request");
        }

        request.Status = RequestStatus.Cancelled.ToString();
        // Using ApprovedByUserId for cancelled by for compatibility
        request.ApprovedByUserId = cancelledByUserId;
        request.ApprovalDate = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepository.UpdateAsync(request);
        await _unitOfWork.SaveChangesAsync();
        
        _logger.LogInformation("Cancelled material request {RequestNumber}", request.RequestNumber);
        return request;
    }

    public async Task<IReadOnlyList<MaterialRequest>> GetRequestsByProjectAsync(int projectId)
    {
        var requests = await _requestRepository.GetRequestsByProjectAsync(projectId);
        // Check feature for first request with company
        var firstRequest = requests.FirstOrDefault();
        if (firstRequest != null)
        {
            await CheckFeatureEnabledAsync(firstRequest.CompanyId);
        }
        return requests.ToList();
    }

    public async Task<IReadOnlyList<MaterialRequest>> GetRequestsByStatusAsync(string status)
    {
        var requests = await _requestRepository.GetRequestsByStatusAsync(status);
        // Check feature for first request with company
        var firstRequest = requests.FirstOrDefault();
        if (firstRequest != null)
        {
            await CheckFeatureEnabledAsync(firstRequest.CompanyId);
        }
        return requests.ToList();
    }

    private async Task<string> GenerateRequestNumberAsync()
    {
        var prefix = "MR";
        var date = DateTime.UtcNow.ToString("yyyyMMdd");
        var existingRequests = await _requestRepository.GetAllAsync();
        var todayRequests = existingRequests
            .Where(r => r.RequestNumber.StartsWith($"{prefix}{date}"))
            .ToList();
        
        var sequence = (todayRequests.Count + 1).ToString("D4");
        return $"{prefix}{date}{sequence}";
    }
}

/// <summary>
/// Implementation of Material Consumption service
/// </summary>
public class MaterialConsumptionService : IMaterialConsumptionService
{
    private readonly IMaterialConsumptionRepository _consumptionRepository;
    private readonly IMaterialStockService _stockService;
    private readonly IRepository<CompanyFeatureSettings> _featureSettingsRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MaterialConsumptionService> _logger;

    public MaterialConsumptionService(
        IMaterialConsumptionRepository consumptionRepository,
        IMaterialStockService stockService,
        IRepository<CompanyFeatureSettings> featureSettingsRepository,
        IUnitOfWork unitOfWork,
        ILogger<MaterialConsumptionService> logger)
    {
        _consumptionRepository = consumptionRepository;
        _stockService = stockService;
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

    public async Task<IReadOnlyList<MaterialConsumption>> GetConsumptionsAsync(int? companyId = null)
    {
        await CheckFeatureEnabledAsync(companyId);
        var consumptions = await _consumptionRepository.GetAllAsync();
        if (companyId.HasValue)
        {
            consumptions = consumptions.Where(c => c.CompanyId == companyId.Value).ToList();
        }
        return consumptions;
    }

    public async Task<MaterialConsumption?> GetConsumptionByIdAsync(int id)
    {
        return await _consumptionRepository.GetByIdAsync(id);
    }

    public async Task<MaterialConsumption> CreateConsumptionAsync(MaterialConsumption consumption)
    {
        await CheckFeatureEnabledAsync(consumption.CompanyId);
        consumption.ConsumptionDate = DateTime.UtcNow;
        
        // Deduct from stock
        await _stockService.AdjustStockAsync(
            consumption.MaterialId,
            "main", // Default warehouse for consumption
            consumption.Quantity,
            "consumption",
            $"Consumed for project {consumption.ProjectId}");

        await _consumptionRepository.AddAsync(consumption);
        await _unitOfWork.SaveChangesAsync();
        
        _logger.LogInformation("Created material consumption {ConsumptionId} for material {MaterialId}", 
            consumption.Id, consumption.MaterialId);
        return consumption;
    }

    public async Task<bool> DeleteConsumptionAsync(int id)
    {
        var consumption = await _consumptionRepository.GetByIdAsync(id);
        if (consumption == null) return false;

        await CheckFeatureEnabledAsync(consumption.CompanyId);
        // Restore stock
        await _stockService.AdjustStockAsync(
            consumption.MaterialId,
            "main",
            consumption.Quantity,
            "return",
            $"Reversed consumption {id}");

        await _consumptionRepository.DeleteAsync(consumption);
        await _unitOfWork.SaveChangesAsync();
        
        _logger.LogInformation("Deleted material consumption {ConsumptionId}", id);
        return true;
    }

    public async Task<IReadOnlyList<MaterialConsumption>> GetConsumptionsByProjectAsync(int projectId)
    {
        var consumptions = await _consumptionRepository.GetConsumptionsByProjectAsync(projectId);
        return consumptions.ToList();
    }

    public async Task<IReadOnlyList<MaterialConsumption>> GetConsumptionsByMaterialAsync(int materialId)
    {
        var consumptions = await _consumptionRepository.GetConsumptionsByMaterialAsync(materialId);
        return consumptions.ToList();
    }

    public async Task<IReadOnlyList<MaterialConsumption>> GetConsumptionsByDateRangeAsync(DateTime startDate, DateTime endDate, int? companyId = null)
    {
        await CheckFeatureEnabledAsync(companyId);
        var consumptions = await _consumptionRepository.GetConsumptionsByDateRangeAsync(startDate, endDate);
        if (companyId.HasValue)
        {
            consumptions = consumptions.Where(c => c.CompanyId == companyId.Value).ToList();
        }
        return consumptions.ToList();
    }
}

/// <summary>
/// Implementation of Warehouse service
/// </summary>
public class WarehouseService : IWarehouseService
{
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly IRepository<CompanyFeatureSettings> _featureSettingsRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<WarehouseService> _logger;

    public WarehouseService(
        IWarehouseRepository warehouseRepository,
        IRepository<CompanyFeatureSettings> featureSettingsRepository,
        IUnitOfWork unitOfWork,
        ILogger<WarehouseService> logger)
    {
        _warehouseRepository = warehouseRepository;
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

    public async Task<IReadOnlyList<Warehouse>> GetWarehousesAsync(int? companyId = null)
    {
        await CheckFeatureEnabledAsync(companyId);
        var warehouses = await _warehouseRepository.GetAllAsync();
        if (companyId.HasValue)
        {
            warehouses = warehouses.Where(w => w.CompanyId == companyId.Value).ToList();
        }
        return warehouses;
    }

    public async Task<Warehouse?> GetWarehouseByIdAsync(int id)
    {
        return await _warehouseRepository.GetByIdAsync(id);
    }

    public async Task<Warehouse> CreateWarehouseAsync(Warehouse warehouse)
    {
        await CheckFeatureEnabledAsync(warehouse.CompanyId);
        await _warehouseRepository.AddAsync(warehouse);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Created warehouse {WarehouseId} - {WarehouseName}", warehouse.Id, warehouse.Name);
        return warehouse;
    }

    public async Task<Warehouse> UpdateWarehouseAsync(Warehouse warehouse)
    {
        await CheckFeatureEnabledAsync(warehouse.CompanyId);
        warehouse.UpdatedAt = DateTime.UtcNow;
        await _warehouseRepository.UpdateAsync(warehouse);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Updated warehouse {WarehouseId}", warehouse.Id);
        return warehouse;
    }

    public async Task<bool> DeleteWarehouseAsync(int id)
    {
        var warehouse = await _warehouseRepository.GetByIdAsync(id);
        if (warehouse == null) return false;

        await CheckFeatureEnabledAsync(warehouse.CompanyId);
        await _warehouseRepository.DeleteAsync(warehouse);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Deleted warehouse {WarehouseId}", id);
        return true;
    }

    public async Task<Warehouse?> GetDefaultWarehouseAsync(int? companyId = null)
    {
        await CheckFeatureEnabledAsync(companyId);
        return await _warehouseRepository.GetDefaultWarehouseAsync();
    }

    public async Task<Warehouse?> GetWarehouseByCodeAsync(string code)
    {
        return await _warehouseRepository.GetWarehouseByCodeAsync(code);
    }
}
