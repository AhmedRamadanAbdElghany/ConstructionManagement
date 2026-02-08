using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// API Controller for Material management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaterialsController : ControllerBase
{
    private readonly IMaterialService _materialService;
    private readonly IMaterialCategoryService _categoryService;

    public MaterialsController(
        IMaterialService materialService,
        IMaterialCategoryService categoryService)
    {
        _materialService = materialService;
        _categoryService = categoryService;
    }

    /// <summary>
    /// Get all materials
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaterialDto>>> GetMaterials([FromQuery] int? companyId = null)
    {
        var materials = await _materialService.GetMaterialsAsync(companyId);
        return Ok(materials);
    }

    /// <summary>
    /// Get material by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<MaterialDto>> GetMaterial(int id)
    {
        var material = await _materialService.GetMaterialByIdAsync(id);
        if (material == null) return NotFound();
        return Ok(material);
    }

    /// <summary>
    /// Create a new material
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<MaterialDto>> CreateMaterial([FromBody] CreateMaterialRequest request)
    {
        var material = new Material
        {
            Name = request.Name,
            Description = request.Description,
            SKU = request.SKU,
            Barcode = request.Barcode,
            CategoryId = request.CategoryId,
            Unit = request.Unit,
            WeightPerUnit = request.WeightPerUnit,
            Dimensions = request.Dimensions,
            MinStockLevel = request.MinStockLevel,
            ReorderQuantity = request.ReorderQuantity,
            StandardCost = request.StandardCost,
            SupplierName = request.SupplierName,
            SupplierContact = request.SupplierContact,
            SupplierPhone = request.SupplierPhone,
            IsActive = request.IsActive,
            IsTracked = request.IsTracked,
            TrackExpiration = request.TrackExpiration,
            ShelfLifeDays = request.ShelfLifeDays,
            StorageLocation = request.StorageLocation,
            Notes = request.Notes,
            ImageUrl = request.ImageUrl,
            CompanyId = request.CompanyId
        };

        var createdMaterial = await _materialService.CreateMaterialAsync(material);
        return CreatedAtAction(nameof(GetMaterial), new { id = createdMaterial.Id }, createdMaterial);
    }

    /// <summary>
    /// Update a material
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<MaterialDto>> UpdateMaterial(int id, [FromBody] CreateMaterialRequest request)
    {
        var material = await _materialService.GetMaterialByIdAsync(id);
        if (material == null) return NotFound();

        material.Name = request.Name;
        material.Description = request.Description;
        material.SKU = request.SKU;
        material.Barcode = request.Barcode;
        material.CategoryId = request.CategoryId;
        material.Unit = request.Unit;
        material.WeightPerUnit = request.WeightPerUnit;
        material.Dimensions = request.Dimensions;
        material.MinStockLevel = request.MinStockLevel;
        material.ReorderQuantity = request.ReorderQuantity;
        material.StandardCost = request.StandardCost;
        material.SupplierName = request.SupplierName;
        material.SupplierContact = request.SupplierContact;
        material.SupplierPhone = request.SupplierPhone;
        material.IsActive = request.IsActive;
        material.IsTracked = request.IsTracked;
        material.TrackExpiration = request.TrackExpiration;
        material.ShelfLifeDays = request.ShelfLifeDays;
        material.StorageLocation = request.StorageLocation;
        material.Notes = request.Notes;
        material.ImageUrl = request.ImageUrl;

        var updatedMaterial = await _materialService.UpdateMaterialAsync(material);
        return Ok(updatedMaterial);
    }

    /// <summary>
    /// Delete a material
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMaterial(int id)
    {
        var result = await _materialService.DeleteMaterialAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Search materials
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<MaterialDto>>> SearchMaterials([FromQuery] string searchTerm, [FromQuery] int? companyId = null)
    {
        var materials = await _materialService.SearchMaterialsAsync(searchTerm, companyId);
        return Ok(materials);
    }

    /// <summary>
    /// Get low stock materials
    /// </summary>
    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<MaterialDto>>> GetLowStockMaterials([FromQuery] int? companyId = null)
    {
        var materials = await _materialService.GetLowStockMaterialsAsync(companyId);
        return Ok(materials);
    }
}

/// <summary>
/// API Controller for Material Category management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaterialCategoriesController : ControllerBase
{
    private readonly IMaterialCategoryService _categoryService;

    public MaterialCategoriesController(IMaterialCategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    /// <summary>
    /// Get all categories
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaterialCategoryDto>>> GetCategories([FromQuery] int? companyId = null)
    {
        var categories = await _categoryService.GetCategoriesAsync(companyId);
        return Ok(categories);
    }

    /// <summary>
    /// Get category by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<MaterialCategoryDto>> GetCategory(int id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    /// <summary>
    /// Get category tree
    /// </summary>
    [HttpGet("tree")]
    public async Task<ActionResult<IEnumerable<MaterialCategoryDto>>> GetCategoryTree([FromQuery] int? companyId = null)
    {
        var categories = await _categoryService.GetCategoryTreeAsync(companyId);
        return Ok(categories);
    }

    /// <summary>
    /// Create a new category
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<MaterialCategoryDto>> CreateCategory([FromBody] CreateMaterialCategoryRequest request)
    {
        var category = new MaterialCategory
        {
            Name = request.Name,
            Description = request.Description,
            Icon = request.Icon,
            ParentCategoryId = request.ParentCategoryId
        };

        var createdCategory = await _categoryService.CreateCategoryAsync(category);
        return CreatedAtAction(nameof(GetCategory), new { id = createdCategory.Id }, createdCategory);
    }

    /// <summary>
    /// Update a category
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<MaterialCategoryDto>> UpdateCategory(int id, [FromBody] CreateMaterialCategoryRequest request)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        if (category == null) return NotFound();

        category.Name = request.Name;
        category.Description = request.Description;
        category.Icon = request.Icon;
        category.ParentCategoryId = request.ParentCategoryId;

        var updatedCategory = await _categoryService.UpdateCategoryAsync(category);
        return Ok(updatedCategory);
    }

    /// <summary>
    /// Delete a category
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCategory(int id)
    {
        var result = await _categoryService.DeleteCategoryAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

/// <summary>
/// API Controller for Material Stock management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaterialStocksController : ControllerBase
{
    private readonly IMaterialStockService _stockService;

    public MaterialStocksController(IMaterialStockService stockService)
    {
        _stockService = stockService;
    }

    /// <summary>
    /// Get all stocks
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaterialStockDto>>> GetStocks([FromQuery] int? companyId = null)
    {
        var stocks = await _stockService.GetStocksAsync(companyId);
        return Ok(stocks);
    }

    /// <summary>
    /// Get stock by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<MaterialStockDto>> GetStock(int id)
    {
        var stock = await _stockService.GetStockByIdAsync(id);
        if (stock == null) return NotFound();
        return Ok(stock);
    }

    /// <summary>
    /// Get stocks by material
    /// </summary>
    [HttpGet("material/{materialId}")]
    public async Task<ActionResult<IEnumerable<MaterialStockDto>>> GetStocksByMaterial(int materialId)
    {
        var stocks = await _stockService.GetStocksByMaterialAsync(materialId);
        return Ok(stocks);
    }

    /// <summary>
    /// Get stocks by warehouse
    /// </summary>
    [HttpGet("warehouse/{warehouseId}")]
    public async Task<ActionResult<IEnumerable<MaterialStockDto>>> GetStocksByWarehouse(string warehouseId)
    {
        var stocks = await _stockService.GetStocksByWarehouseAsync(warehouseId);
        return Ok(stocks);
    }

    /// <summary>
    /// Adjust stock
    /// </summary>
    [HttpPost("adjust")]
    public async Task<ActionResult<MaterialStockDto>> AdjustStock([FromBody] StockAdjustmentDto request)
    {
        var stock = await _stockService.AdjustStockAsync(
            request.MaterialId,
            request.WarehouseId,
            request.Quantity,
            request.TransactionType,
            request.Notes);
        return Ok(stock);
    }

    /// <summary>
    /// Check availability
    /// </summary>
    [HttpGet("check-availability")]
    public async Task<ActionResult<bool>> CheckAvailability(
        [FromQuery] int materialId,
        [FromQuery] string warehouseId,
        [FromQuery] decimal quantity)
    {
        var available = await _stockService.CheckAvailabilityAsync(materialId, warehouseId, quantity);
        return Ok(available);
    }
}

/// <summary>
/// API Controller for Material Request management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaterialRequestsController : ControllerBase
{
    private readonly IMaterialRequestService _requestService;

    public MaterialRequestsController(IMaterialRequestService requestService)
    {
        _requestService = requestService;
    }

    /// <summary>
    /// Get all requests
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaterialRequestDto>>> GetRequests([FromQuery] int? companyId = null)
    {
        var requests = await _requestService.GetRequestsAsync(companyId);
        return Ok(requests);
    }

    /// <summary>
    /// Get request by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<MaterialRequestDto>> GetRequest(int id)
    {
        var request = await _requestService.GetRequestByIdAsync(id);
        if (request == null) return NotFound();
        return Ok(request);
    }

    /// <summary>
    /// Get requests by project
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<MaterialRequestDto>>> GetRequestsByProject(int projectId)
    {
        var requests = await _requestService.GetRequestsByProjectAsync(projectId);
        return Ok(requests);
    }

    /// <summary>
    /// Get requests by status
    /// </summary>
    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<MaterialRequestDto>>> GetRequestsByStatus(string status)
    {
        var requests = await _requestService.GetRequestsByStatusAsync(status);
        return Ok(requests);
    }

    /// <summary>
    /// Create a new request
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<MaterialRequestDto>> CreateRequest([FromBody] CreateMaterialRequestDto request)
    {
        var materialRequest = new MaterialRequest
        {
            ProjectId = request.ProjectId,
            Priority = request.Priority,
            RequiredDate = request.RequiredDate,
            SourceWarehouse = request.SourceWarehouse,
            DeliveryLocation = request.DeliveryLocation,
            Notes = request.Notes,
            RequestedByUserId = 1 // TODO: Get from current user
        };

        foreach (var item in request.Items)
        {
            materialRequest.Items.Add(new MaterialRequestItem
            {
                MaterialId = item.MaterialId,
                RequestedQuantity = item.RequestedQuantity,
                Notes = item.Notes
            });
        }

        var createdRequest = await _requestService.CreateRequestAsync(materialRequest);
        return CreatedAtAction(nameof(GetRequest), new { id = createdRequest.Id }, createdRequest);
    }

    /// <summary>
    /// Approve a request
    /// </summary>
    [HttpPost("{id}/approve")]
    public async Task<ActionResult<MaterialRequestDto>> ApproveRequest(int id)
    {
        var approvedRequest = await _requestService.ApproveRequestAsync(id, 1); // TODO: Get from current user
        return Ok(approvedRequest);
    }

    /// <summary>
    /// Reject a request
    /// </summary>
    [HttpPost("{id}/reject")]
    public async Task<ActionResult<MaterialRequestDto>> RejectRequest(int id, [FromBody] RejectRequestDto dto)
    {
        var rejectedRequest = await _requestService.RejectRequestAsync(id, dto.Reason, 1); // TODO: Get from current user
        return Ok(rejectedRequest);
    }

    /// <summary>
    /// Fulfill a request
    /// </summary>
    [HttpPost("{id}/fulfill")]
    public async Task<ActionResult<MaterialRequestDto>> FulfillRequest(int id)
    {
        var fulfilledRequest = await _requestService.FulfillRequestAsync(id, 1); // TODO: Get from current user
        return Ok(fulfilledRequest);
    }

    /// <summary>
    /// Cancel a request
    /// </summary>
    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<MaterialRequestDto>> CancelRequest(int id)
    {
        var cancelledRequest = await _requestService.CancelRequestAsync(id, 1); // TODO: Get from current user
        return Ok(cancelledRequest);
    }
}

public class RejectRequestDto
{
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// API Controller for Material Consumption management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaterialConsumptionsController : ControllerBase
{
    private readonly IMaterialConsumptionService _consumptionService;

    public MaterialConsumptionsController(IMaterialConsumptionService consumptionService)
    {
        _consumptionService = consumptionService;
    }

    /// <summary>
    /// Get all consumptions
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaterialConsumptionDto>>> GetConsumptions([FromQuery] int? companyId = null)
    {
        var consumptions = await _consumptionService.GetConsumptionsAsync(companyId);
        return Ok(consumptions);
    }

    /// <summary>
    /// Get consumption by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<MaterialConsumptionDto>> GetConsumption(int id)
    {
        var consumption = await _consumptionService.GetConsumptionByIdAsync(id);
        if (consumption == null) return NotFound();
        return Ok(consumption);
    }

    /// <summary>
    /// Get consumptions by project
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<MaterialConsumptionDto>>> GetConsumptionsByProject(int projectId)
    {
        var consumptions = await _consumptionService.GetConsumptionsByProjectAsync(projectId);
        return Ok(consumptions);
    }

    /// <summary>
    /// Get consumptions by material
    /// </summary>
    [HttpGet("material/{materialId}")]
    public async Task<ActionResult<IEnumerable<MaterialConsumptionDto>>> GetConsumptionsByMaterial(int materialId)
    {
        var consumptions = await _consumptionService.GetConsumptionsByMaterialAsync(materialId);
        return Ok(consumptions);
    }

    /// <summary>
    /// Get consumptions by date range
    /// </summary>
    [HttpGet("daterange")]
    public async Task<ActionResult<IEnumerable<MaterialConsumptionDto>>> GetConsumptionsByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int? companyId = null)
    {
        var consumptions = await _consumptionService.GetConsumptionsByDateRangeAsync(startDate, endDate, companyId);
        return Ok(consumptions);
    }

    /// <summary>
    /// Create a new consumption
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<MaterialConsumptionDto>> CreateConsumption([FromBody] CreateMaterialConsumptionDto dto)
    {
        var consumption = new MaterialConsumption
        {
            MaterialId = dto.MaterialId,
            ProjectId = dto.ProjectId,
            PhaseId = dto.PhaseId,
            BOQItemId = dto.BOQItemId,
            ItemDailyLogId = dto.ItemDailyLogId,
            MaterialRequestId = dto.MaterialRequestId,
            Quantity = dto.Quantity,
            Unit = dto.Unit,
            UnitCost = dto.UnitCost,
            ConsumptionDate = dto.ConsumptionDate,
            Notes = dto.Notes,
            RecordedByUserId = 1 // TODO: Get from current user
        };

        var createdConsumption = await _consumptionService.CreateConsumptionAsync(consumption);
        return CreatedAtAction(nameof(GetConsumption), new { id = createdConsumption.Id }, createdConsumption);
    }

    /// <summary>
    /// Delete a consumption
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteConsumption(int id)
    {
        var result = await _consumptionService.DeleteConsumptionAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

/// <summary>
/// API Controller for Warehouse management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;

    public WarehousesController(IWarehouseService warehouseService)
    {
        _warehouseService = warehouseService;
    }

    /// <summary>
    /// Get all warehouses
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WarehouseDto>>> GetWarehouses([FromQuery] int? companyId = null)
    {
        var warehouses = await _warehouseService.GetWarehousesAsync(companyId);
        return Ok(warehouses);
    }

    /// <summary>
    /// Get warehouse by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<WarehouseDto>> GetWarehouse(int id)
    {
        var warehouse = await _warehouseService.GetWarehouseByIdAsync(id);
        if (warehouse == null) return NotFound();
        return Ok(warehouse);
    }

    /// <summary>
    /// Get default warehouse
    /// </summary>
    [HttpGet("default")]
    public async Task<ActionResult<WarehouseDto>> GetDefaultWarehouse([FromQuery] int? companyId = null)
    {
        var warehouse = await _warehouseService.GetDefaultWarehouseAsync(companyId);
        if (warehouse == null) return NotFound();
        return Ok(warehouse);
    }

    /// <summary>
    /// Create a new warehouse
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<WarehouseDto>> CreateWarehouse([FromBody] WarehouseDto dto)
    {
        var warehouse = new Warehouse
        {
            Name = dto.Name,
            Code = dto.Code,
            Description = dto.Description,
            Address = dto.Address,
            City = dto.City,
            IsDefault = dto.IsDefault,
            IsActive = dto.IsActive,
            ManagerUserId = dto.ManagerUserId,
            Phone = dto.Phone,
            Email = dto.Email,
            OperatingHours = dto.OperatingHours,
            Notes = dto.Notes
        };

        var createdWarehouse = await _warehouseService.CreateWarehouseAsync(warehouse);
        return CreatedAtAction(nameof(GetWarehouse), new { id = createdWarehouse.Id }, createdWarehouse);
    }

    /// <summary>
    /// Update a warehouse
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<WarehouseDto>> UpdateWarehouse(int id, [FromBody] WarehouseDto dto)
    {
        var warehouse = await _warehouseService.GetWarehouseByIdAsync(id);
        if (warehouse == null) return NotFound();

        warehouse.Name = dto.Name;
        warehouse.Code = dto.Code;
        warehouse.Description = dto.Description;
        warehouse.Address = dto.Address;
        warehouse.City = dto.City;
        warehouse.IsDefault = dto.IsDefault;
        warehouse.IsActive = dto.IsActive;
        warehouse.ManagerUserId = dto.ManagerUserId;
        warehouse.Phone = dto.Phone;
        warehouse.Email = dto.Email;
        warehouse.OperatingHours = dto.OperatingHours;
        warehouse.Notes = dto.Notes;

        var updatedWarehouse = await _warehouseService.UpdateWarehouseAsync(warehouse);
        return Ok(updatedWarehouse);
    }

    /// <summary>
    /// Delete a warehouse
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteWarehouse(int id)
    {
        var result = await _warehouseService.DeleteWarehouseAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
