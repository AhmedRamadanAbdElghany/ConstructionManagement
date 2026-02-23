using ConstructionManagement.Application.DTOs.Marketplace;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for managing product categories in the marketplace
/// </summary>
public class ProductCategoryService : IProductCategoryService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ProductCategoryService> _logger;

    public ProductCategoryService(
        ApplicationDbContext context,
        ILogger<ProductCategoryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<ProductCategoryDto>> GetCategoriesAsync(bool includeUnapproved = false)
    {
        var query = _context.ProductCategories
            .Include(c => c.ParentCategory)
            .AsQueryable();

        if (!includeUnapproved)
        {
            query = query.Where(c => c.IsApproved);
        }

        var categories = await query
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();

        return categories.Select(MapToDto);
    }

    public async Task<IEnumerable<ProductCategoryDto>> GetCategoryTreeAsync()
    {
        var categories = await _context.ProductCategories
            .Include(c => c.ParentCategory)
            .Include(c => c.SubCategories)
            .Where(c => c.IsApproved)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();

        var rootCategories = categories.Where(c => c.ParentCategoryId == null);
        return rootCategories.Select(c => MapToDtoWithChildren(c));
    }

    public async Task<ProductCategoryDto?> GetCategoryByIdAsync(int id)
    {
        var category = await _context.ProductCategories
            .Include(c => c.ParentCategory)
            .FirstOrDefaultAsync(c => c.Id == id);

        return category != null ? MapToDto(category) : null;
    }

    public async Task<ProductCategoryDto> CreateCategoryAsync(CreateProductCategoryRequest request)
    {
        var category = new ProductCategory
        {
            Name = request.Name,
            NameAr = request.NameAr,
            Description = request.Description,
            Icon = request.Icon,
            ParentCategoryId = request.ParentCategoryId,
            IsApproved = true,
            IsSystemCategory = false
        };

        _context.ProductCategories.Add(category);
        await _context.SaveChangesAsync();

        return MapToDto(category);
    }

    public async Task<ProductCategoryDto> UpdateCategoryAsync(int id, UpdateProductCategoryRequest request)
    {
        var category = await _context.ProductCategories.FindAsync(id)
            ?? throw new KeyNotFoundException($"Category with ID {id} not found");

        if (category.IsSystemCategory)
        {
            throw new InvalidOperationException("Cannot modify system categories");
        }

        category.Name = request.Name;
        category.NameAr = request.NameAr;
        category.Description = request.Description;
        category.Icon = request.Icon;
        category.ParentCategoryId = request.ParentCategoryId;
        category.SortOrder = request.SortOrder;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(category);
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.ProductCategories
            .Include(c => c.Products)
            .Include(c => c.SubCategories)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            return false;

        if (category.IsSystemCategory)
        {
            throw new InvalidOperationException("Cannot delete system categories");
        }

        if (category.Products.Any())
        {
            throw new InvalidOperationException("Cannot delete category with products");
        }

        if (category.SubCategories.Any())
        {
            throw new InvalidOperationException("Cannot delete category with sub-categories");
        }

        _context.ProductCategories.Remove(category);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<CategoryRequestDto>> GetCategoryRequestsAsync(string? status = null)
    {
        var query = _context.CategoryRequests
            .Include(r => r.User)
            .Include(r => r.ParentCategory)
            .Include(r => r.ReviewedBy)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(r => r.Status == status);
        }

        var requests = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(MapRequestToDto);
    }

    public async Task<CategoryRequestDto?> GetCategoryRequestByIdAsync(int id)
    {
        var request = await _context.CategoryRequests
            .Include(r => r.User)
            .Include(r => r.ParentCategory)
            .Include(r => r.ReviewedBy)
            .FirstOrDefaultAsync(r => r.Id == id);

        return request != null ? MapRequestToDto(request) : null;
    }

    public async Task<CategoryRequestDto> CreateCategoryRequestAsync(int userId, CreateCategoryRequestRequest request)
    {
        // Check if category already exists
        var exists = await CategoryExistsAsync(request.Name, request.NameAr);
        if (exists)
        {
            throw new InvalidOperationException("Category with this name already exists");
        }

        // Check if there's already a pending request for this category
        var existingRequest = await _context.CategoryRequests
            .AnyAsync(r => r.Name.ToLower() == request.Name.ToLower() && r.Status == "Pending");

        if (existingRequest)
        {
            throw new InvalidOperationException("A pending request for this category already exists");
        }

        var categoryRequest = new CategoryRequest
        {
            UserId = userId,
            Name = request.Name,
            NameAr = request.NameAr,
            Description = request.Description,
            ParentCategoryId = request.ParentCategoryId,
            Status = "Pending"
        };

        _context.CategoryRequests.Add(categoryRequest);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Category request created: {RequestId} by User {UserId}", categoryRequest.Id, userId);

        return MapRequestToDto(categoryRequest);
    }

    public async Task<CategoryRequestDto> ReviewCategoryRequestAsync(int requestId, int reviewerUserId, ReviewCategoryRequestRequest request)
    {
        var categoryRequest = await _context.CategoryRequests
            .Include(r => r.User)
            .Include(r => r.ParentCategory)
            .FirstOrDefaultAsync(r => r.Id == requestId)
            ?? throw new KeyNotFoundException($"Category request with ID {requestId} not found");

        if (categoryRequest.Status != "Pending")
        {
            throw new InvalidOperationException("This request has already been reviewed");
        }

        categoryRequest.ReviewedByUserId = reviewerUserId;
        categoryRequest.ReviewedAt = DateTime.UtcNow;
        categoryRequest.Notes = request.Notes;

        if (request.IsApproved)
        {
            // Create the new category
            var newCategory = new ProductCategory
            {
                Name = categoryRequest.Name,
                NameAr = categoryRequest.NameAr ?? "",
                Description = categoryRequest.Description,
                ParentCategoryId = categoryRequest.ParentCategoryId,
                IsApproved = true,
                IsSystemCategory = false
            };

            _context.ProductCategories.Add(newCategory);
            await _context.SaveChangesAsync();

            categoryRequest.Status = "Approved";
            categoryRequest.CreatedCategoryId = newCategory.Id;

            _logger.LogInformation("Category request {RequestId} approved. New category {CategoryId} created",
                requestId, newCategory.Id);
        }
        else
        {
            categoryRequest.Status = "Rejected";

            // If pointing to existing category
            if (request.ExistingCategoryId.HasValue)
            {
                categoryRequest.Notes = $"{categoryRequest.Notes}\nExisting category suggested: ID {request.ExistingCategoryId}";
            }

            _logger.LogInformation("Category request {RequestId} rejected", requestId);
        }

        await _context.SaveChangesAsync();

        return MapRequestToDto(categoryRequest);
    }

    public async Task<IEnumerable<ProductCategoryDto>> GetSubCategoriesAsync(int parentCategoryId)
    {
        var categories = await _context.ProductCategories
            .Include(c => c.ParentCategory)
            .Where(c => c.ParentCategoryId == parentCategoryId && c.IsApproved)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();

        return categories.Select(MapToDto);
    }

    public async Task<IEnumerable<ProductCategoryDto>> GetMainCategoriesAsync()
    {
        var categories = await _context.ProductCategories
            .Include(c => c.ParentCategory)
            .Where(c => c.ParentCategoryId == null && c.IsApproved)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();

        return categories.Select(MapToDto);
    }

    public async Task<bool> CategoryExistsAsync(string name, string? nameAr = null)
    {
        return await _context.ProductCategories
            .AnyAsync(c => c.Name.ToLower() == name.ToLower() ||
                          (!string.IsNullOrEmpty(nameAr) && c.NameAr == nameAr));
    }

    private static ProductCategoryDto MapToDto(ProductCategory category)
    {
        return new ProductCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            NameAr = category.NameAr,
            Description = category.Description,
            Icon = category.Icon,
            ParentCategoryId = category.ParentCategoryId,
            ParentCategoryName = category.ParentCategory?.Name,
            IsApproved = category.IsApproved,
            IsSystemCategory = category.IsSystemCategory,
            SortOrder = category.SortOrder,
            ProductCount = category.Products?.Count ?? 0
        };
    }

    private static ProductCategoryDto MapToDtoWithChildren(ProductCategory category)
    {
        var dto = MapToDto(category);
        dto.SubCategories = category.SubCategories
            .Where(c => c.IsApproved)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(MapToDtoWithChildren)
            .ToList();
        return dto;
    }

    private static CategoryRequestDto MapRequestToDto(CategoryRequest request)
    {
        return new CategoryRequestDto
        {
            Id = request.Id,
            UserId = request.UserId,
            UserName = request.User?.FullName ?? request.User?.Email,
            Name = request.Name,
            NameAr = request.NameAr,
            Description = request.Description,
            ParentCategoryId = request.ParentCategoryId,
            ParentCategoryName = request.ParentCategory?.Name,
            Status = request.Status,
            ReviewedByUserId = request.ReviewedByUserId,
            ReviewedByName = request.ReviewedBy?.FullName ?? request.ReviewedBy?.Email,
            ReviewedAt = request.ReviewedAt,
            Notes = request.Notes,
            CreatedCategoryId = request.CreatedCategoryId,
            CreatedAt = request.CreatedAt
        };
    }
}
