using ConstructionManagement.Application.DTOs.Portfolio;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class PortfolioService : IPortfolioService
{
    private readonly IRepository<PortfolioCategory> _categoryRepository;
    private readonly IRepository<PortfolioItem> _itemRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICompanyContext _companyContext;

    public PortfolioService(
        IRepository<PortfolioCategory> categoryRepository,
        IRepository<PortfolioItem> itemRepository,
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork,
        ICompanyContext companyContext)
    {
        _categoryRepository = categoryRepository;
        _itemRepository = itemRepository;
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
        _companyContext = companyContext;
    }

    #region Category Operations

    public async Task<int> CreateCategoryAsync(CreatePortfolioCategoryRequest request)
    {
        if (request.ParentCategoryId.HasValue)
        {
            var parent = await _categoryRepository.GetByIdAsync(request.ParentCategoryId.Value);
            if (parent == null || parent.CompanyId != _companyContext.CompanyId)
                throw new UnauthorizedAccessException("Parent category does not belong to your company.");
        }

        var category = new PortfolioCategory
        {
            Name = request.Name,
            Description = request.Description,
            Order = request.Order ?? 0,
            ParentCategoryId = request.ParentCategoryId,
            CompanyId = _companyContext.CompanyId
        };

        await _categoryRepository.AddAsync(category);
        await _unitOfWork.SaveChangesAsync();
        return category.Id;
    }

    public async Task UpdateCategoryAsync(int categoryId, UpdatePortfolioCategoryRequest request)
    {
        var category = await _categoryRepository.GetByIdAsync(categoryId);
        if (category == null) throw new KeyNotFoundException($"Category with ID {categoryId} not found");

        if (category.CompanyId != _companyContext.CompanyId)
            throw new UnauthorizedAccessException("You do not have permission to update this category.");

        if (request.Name != null) category.Name = request.Name;
        if (request.Description != null) category.Description = request.Description;
        if (request.Order != null) category.Order = request.Order.Value;
        if (request.ParentCategoryId != null && request.ParentCategoryId != categoryId)
            category.ParentCategoryId = request.ParentCategoryId;

        await _categoryRepository.UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteCategoryAsync(int categoryId)
    {
        var category = await _categoryRepository.AsQueryable()
            .IgnoreQueryFilters()
            .Include(c => c.ChildCategories)
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == categoryId);

        if (category == null) throw new KeyNotFoundException($"Category with ID {categoryId} not found");

        if (category.CompanyId != _companyContext.CompanyId)
            throw new UnauthorizedAccessException("You do not have permission to delete this category.");

        // Use iterative approach with a stack to avoid stack overflow for deeply nested trees
        var categoriesToDelete = new Stack<PortfolioCategory>();
        var categoriesToProcess = new Stack<PortfolioCategory>();
        categoriesToProcess.Push(category);

        // First, collect all categories in bottom-up order (children before parents)
        while (categoriesToProcess.Count > 0)
        {
            var current = categoriesToProcess.Pop();
            categoriesToDelete.Push(current);

            // Load children for this category if not already loaded
            var children = await _categoryRepository.AsQueryable()
                .IgnoreQueryFilters()
                .Where(c => c.ParentCategoryId == current.Id)
                .ToListAsync();

            foreach (var child in children)
            {
                categoriesToProcess.Push(child);
            }
        }

        // Now delete in reverse order (children first, then parents)
        while (categoriesToDelete.Count > 0)
        {
            var toDelete = categoriesToDelete.Pop();

            // Load items for this category
            var items = await _itemRepository.AsQueryable()
                .IgnoreQueryFilters()
                .Where(i => i.CategoryId == toDelete.Id)
                .ToListAsync();

            // Delete items
            foreach (var item in items)
            {
                if (!string.IsNullOrEmpty(item.FileUrl))
                {
                    await _fileStorageService.DeleteFileAsync(item.FileUrl);
                }
                await _itemRepository.DeleteAsync(item);
            }

            await _categoryRepository.DeleteAsync(toDelete);
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<PortfolioCategoryDto> GetCategoryAsync(int categoryId)
    {
        var category = await _categoryRepository.AsQueryable()
            .IgnoreQueryFilters() // Allow viewing without company context if needed (e.g. public view)
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == categoryId);

        if (category == null) throw new KeyNotFoundException($"Category with ID {categoryId} not found");

        return MapCategoryToDto(category);
    }

    public async Task<IEnumerable<PortfolioCategoryDto>> GetCompanyPortfolioStructureAsync(int companyId)
    {
        // Use IgnoreQueryFilters to view other companies' portfolios
        var allCategories = await _categoryRepository.AsQueryable()
            .IgnoreQueryFilters()
            .Where(c => c.CompanyId == companyId)
            .Include(c => c.Items)
            .ToListAsync();

        var rootCategories = allCategories.Where(c => c.ParentCategoryId == null).OrderBy(c => c.Order).ToList();

        return rootCategories.Select(c => BuildCategoryTree(c, allCategories));
    }

    #endregion

    #region Item Operations

    public async Task<int> CreateItemAsync(CreatePortfolioItemRequest request)
    {
        // Verify Category ownership
        if (request.CategoryId.HasValue)
        {
            var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value);
            if (category == null || category.CompanyId != _companyContext.CompanyId)
                throw new UnauthorizedAccessException("Category does not belong to your company.");
        }

        var item = new PortfolioItem
        {
            Name = request.Name,
            Description = request.Description,
            CategoryId = request.CategoryId,
            CompanyId = _companyContext.CompanyId,
            CompletionDate = request.CompletionDate,
            ClientName = request.ClientName,
            Location = request.Location
        };

        if (request.File != null)
        {
            var fileResult = await _fileStorageService.SaveFileAsync(request.File, "portfolios");
            item.FileUrl = fileResult.Path;
            item.FileName = fileResult.FileName;
            item.FileSize = request.File.Length;
            item.FileType = request.File.ContentType;
            item.OriginalFileName = request.File.FileName;
        }

        await _itemRepository.AddAsync(item);
        await _unitOfWork.SaveChangesAsync();
        return item.Id;
    }

    public async Task UpdateItemAsync(int itemId, UpdatePortfolioItemRequest request)
    {
        var item = await _itemRepository.GetByIdAsync(itemId);
        if (item == null) throw new KeyNotFoundException($"Item with ID {itemId} not found");

        if (item.CompanyId != _companyContext.CompanyId)
            throw new UnauthorizedAccessException("You do not have permission to update this item.");

        if (request.CategoryId != null && request.CategoryId != item.CategoryId)
        {
            var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value);
            if (category == null || category.CompanyId != _companyContext.CompanyId)
                throw new UnauthorizedAccessException("Target category does not belong to your company.");
        }

        if (request.Name != null) item.Name = request.Name;
        if (request.Description != null) item.Description = request.Description;
        if (request.CategoryId != null) item.CategoryId = request.CategoryId;
        if (request.CompletionDate != null) item.CompletionDate = request.CompletionDate;
        if (request.ClientName != null) item.ClientName = request.ClientName;
        if (request.Location != null) item.Location = request.Location;

        if (request.File != null)
        {
            if (!string.IsNullOrEmpty(item.FileUrl))
            {
                await _fileStorageService.DeleteFileAsync(item.FileUrl);
            }

            var fileResult = await _fileStorageService.SaveFileAsync(request.File, "portfolios");
            item.FileUrl = fileResult.Path;
            item.FileName = fileResult.FileName;
            item.FileSize = request.File.Length;
            item.FileType = request.File.ContentType;
            item.OriginalFileName = request.File.FileName;
        }

        await _itemRepository.UpdateAsync(item);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteItemAsync(int itemId)
    {
        var item = await _itemRepository.GetByIdAsync(itemId);
        if (item == null) throw new KeyNotFoundException($"Item with ID {itemId} not found");

        if (item.CompanyId != _companyContext.CompanyId)
            throw new UnauthorizedAccessException("You do not have permission to delete this item.");

        if (!string.IsNullOrEmpty(item.FileUrl))
        {
            await _fileStorageService.DeleteFileAsync(item.FileUrl);
        }

        await _itemRepository.DeleteAsync(item);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<PortfolioItemDto> GetItemAsync(int itemId)
    {
        var item = await _itemRepository.AsQueryable()
            .IgnoreQueryFilters()
            .Include(i => i.Category)
            .FirstOrDefaultAsync(i => i.Id == itemId);

        if (item == null) throw new KeyNotFoundException($"Item with ID {itemId} not found");

        return MapItemToDto(item);
    }

    public async Task<IEnumerable<PortfolioItemDto>> GetItemsByCategoryAsync(int categoryId)
    {
        var items = await _itemRepository.AsQueryable()
            .IgnoreQueryFilters() // Allow public access (if category implies public)
            .Where(i => i.CategoryId == categoryId)
            .Include(i => i.Category)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return items.Select(MapItemToDto);
    }

    #endregion

    #region Helpers

    private PortfolioItemDto MapItemToDto(PortfolioItem item)
    {
        return new PortfolioItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Description = item.Description,
            CategoryId = item.CategoryId,
            CategoryName = item.Category?.Name,
            FileUrl = item.FileUrl,
            FileName = item.FileName,
            FileSize = item.FileSize,
            FileType = item.FileType,
            CreatedAt = item.CreatedAt,
            CompletionDate = item.CompletionDate,
            ClientName = item.ClientName,
            Location = item.Location
        };
    }

    private PortfolioCategoryDto MapCategoryToDto(PortfolioCategory category)
    {
        return new PortfolioCategoryDto
        {
            Id = category.Id,
            CompanyId = category.CompanyId,
            Name = category.Name,
            Description = category.Description,
            Order = category.Order,
            ParentCategoryId = category.ParentCategoryId,
            ChildCategories = new List<PortfolioCategoryDto>(),
            Items = new List<PortfolioItemDto>(),
            ItemCount = category.Items?.Count ?? 0
        };
    }

    private PortfolioCategoryDto BuildCategoryTree(PortfolioCategory category, List<PortfolioCategory> allCategories)
    {
        var dto = MapCategoryToDto(category);

        // Map items
        dto.Items = category.Items?.Select(MapItemToDto).ToList() ?? new List<PortfolioItemDto>();

        // Build children recursively
        var children = allCategories.Where(c => c.ParentCategoryId == category.Id).OrderBy(c => c.Order).ToList();
        dto.ChildCategories = children.Select(c => BuildCategoryTree(c, allCategories)).ToList();
        
        // Count items recursively
        dto.ItemCount = dto.Items.Count + dto.ChildCategories.Sum(c => c.ItemCount);

        return dto;
    }

    #endregion
}
