using ConstructionManagement.Application.DTOs.Design;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class DesignService : IDesignService
{
    private readonly IRepository<Design> _designRepository;
    private readonly IRepository<DesignCategory> _categoryRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICompanyContext _companyContext;

    public DesignService(
        IRepository<Design> designRepository,
        IRepository<DesignCategory> categoryRepository,
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork,
        ICompanyContext companyContext)
    {
        _designRepository = designRepository;
        _categoryRepository = categoryRepository;
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
        _companyContext = companyContext;
    }

    #region Design Operations

    public async Task<int> CreateDesignAsync(int projectId, CreateDesignRequest request)
    {
        var design = new Design
        {
            ProjectId = projectId,
            Name = request.Name,
            Description = request.Description,
            CategoryId = request.CategoryId,
            Status = request.Status,
            CompanyId = _companyContext.CompanyId,
            CreatedByUserId = _companyContext.CurrentUserId,
            ChangeNotes = request.ChangeNotes,
            ParentDesignId = request.ParentDesignId,
            Version = request.CreateAsNewVersion ? await GetNextVersionAsync(request.ParentDesignId ?? 0) : 1
        };

        // Handle file upload
        if (request.File != null)
        {
            var fileResult = await _fileStorageService.SaveFileAsync(request.File, "designs");
            design.FileUrl = fileResult.Path;
            design.FileName = fileResult.FileName;
            design.FileSize = request.File.Length;
            design.FileType = request.File.ContentType;
            design.OriginalFileName = request.File.FileName;
        }

        await _designRepository.AddAsync(design);
        await _unitOfWork.SaveChangesAsync();
        return design.Id;
    }

    public async Task<DesignDto> GetDesignAsync(int designId)
    {
        var design = await _designRepository.AsQueryable()
            .Include(d => d.Category)
            .Include(d => d.CreatedByUser)
            .FirstOrDefaultAsync(d => d.Id == designId);

        if (design == null) throw new KeyNotFoundException($"Design with ID {designId} not found");

        return MapToDto(design);
    }

    public async Task<IEnumerable<DesignDto>> GetProjectDesignsAsync(int projectId)
    {
        var designs = await _designRepository.AsQueryable()
            .Where(d => d.ProjectId == projectId)
            .Include(d => d.Category)
            .Include(d => d.CreatedByUser)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return designs.Select(MapToDto);
    }

    public async Task<IEnumerable<DesignDto>> GetProjectDesignsByCategoryAsync(int projectId, int? categoryId)
    {
        var designs = await _designRepository.AsQueryable()
            .Where(d => d.ProjectId == projectId && d.CategoryId == categoryId)
            .Include(d => d.Category)
            .Include(d => d.CreatedByUser)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return designs.Select(MapToDto);
    }

    public async Task UpdateDesignAsync(int designId, UpdateDesignRequest request)
    {
        var design = await _designRepository.GetByIdAsync(designId);
        if (design == null) throw new KeyNotFoundException($"Design with ID {designId} not found");

        if (request.Name != null) design.Name = request.Name;
        if (request.Description != null) design.Description = request.Description;
        if (request.CategoryId != null) design.CategoryId = request.CategoryId;
        design.Status = request.Status;
        if (request.ChangeNotes != null) design.ChangeNotes = request.ChangeNotes;

        // Handle file upload
        if (request.File != null)
        {
            // Delete old file if exists
            if (!string.IsNullOrEmpty(design.FileUrl))
            {
                await _fileStorageService.DeleteFileAsync(design.FileUrl);
            }

            var fileResult = await _fileStorageService.SaveFileAsync(request.File, "designs");
            design.FileUrl = fileResult.Path;
            design.FileName = fileResult.FileName;
            design.FileSize = request.File.Length;
            design.FileType = request.File.ContentType;
            design.OriginalFileName = request.File.FileName;
        }

        await _designRepository.UpdateAsync(design);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteDesignAsync(int designId)
    {
        var design = await _designRepository.GetByIdAsync(designId);
        if (design == null) throw new KeyNotFoundException($"Design with ID {designId} not found");

        // Delete file if exists
        if (!string.IsNullOrEmpty(design.FileUrl))
        {
            await _fileStorageService.DeleteFileAsync(design.FileUrl);
        }

        await _designRepository.DeleteAsync(design);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<IEnumerable<DesignDto>> GetDesignVersionsAsync(int designId)
    {
        // Find root design
        var rootDesign = await _designRepository.AsQueryable()
            .FirstOrDefaultAsync(d => d.Id == designId);

        if (rootDesign == null) throw new KeyNotFoundException($"Design with ID {designId} not found");

        // Find all versions (same root lineage)
        var allVersions = await _designRepository.AsQueryable()
            .Where(d => d.Id == designId || d.ParentDesignId == designId || d.Versions.Any(v => v.Id == designId))
            .Include(d => d.CreatedByUser)
            .ToListAsync();

        // Also get versions linked through parent chain
        var currentId = designId;
        while (true)
        {
            var parent = await _designRepository.GetByIdAsync(currentId);
            if (parent?.ParentDesignId == null) break;
            
            var parentVersions = await _designRepository.AsQueryable()
                .Where(d => d.ParentDesignId == parent.ParentDesignId)
                .Include(d => d.CreatedByUser)
                .ToListAsync();
            
            allVersions.AddRange(parentVersions.ExceptBy(allVersions.Select(v => v.Id), v => v.Id));
            currentId = parent.ParentDesignId.Value;
        }

        return allVersions.Select(MapToDto).OrderByDescending(d => d.Version);
    }

    private async Task<int> GetNextVersionAsync(int parentDesignId)
    {
        if (parentDesignId == 0) return 1;

        var latestVersion = await _designRepository.AsQueryable()
            .Where(d => d.Id == parentDesignId || d.ParentDesignId == parentDesignId)
            .MaxAsync(d => d.Version);

        return latestVersion + 1;
    }

    #endregion

    #region Category Operations

    public async Task<int> CreateCategoryAsync(CreateCategoryRequest request)
    {
        var category = new DesignCategory
        {
            Name = request.Name,
            Description = request.Description,
            Order = request.Order ?? 0,
            ParentCategoryId = request.ParentCategoryId,
            ProjectId = request.ProjectId,
            CompanyId = _companyContext.CompanyId
        };

        await _categoryRepository.AddAsync(category);
        await _unitOfWork.SaveChangesAsync();
        return category.Id;
    }

    public async Task<DesignCategoryDto> GetCategoryAsync(int categoryId)
    {
        var category = await _categoryRepository.AsQueryable()
            .Include(c => c.Designs)
            .FirstOrDefaultAsync(c => c.Id == categoryId);

        if (category == null) throw new KeyNotFoundException($"Category with ID {categoryId} not found");

        return MapCategoryToDto(category);
    }

    public async Task<IEnumerable<DesignCategoryDto>> GetProjectCategoriesAsync(int projectId)
    {
        var categories = await _categoryRepository.AsQueryable()
            .Where(c => c.ProjectId == projectId && c.ParentCategoryId == null)
            .Include(c => c.ChildCategories)
            .Include(c => c.Designs)
            .OrderBy(c => c.Order)
            .ToListAsync();

        return categories.Select(MapCategoryToDto);
    }

    public async Task<IEnumerable<DesignCategoryDto>> GetCategoryTreeAsync(int projectId)
    {
        var allCategories = await _categoryRepository.AsQueryable()
            .Where(c => c.ProjectId == projectId)
            .Include(c => c.Designs)
            .ToListAsync();

        var rootCategories = allCategories.Where(c => c.ParentCategoryId == null).OrderBy(c => c.Order).ToList();
        
        return rootCategories.Select(c => BuildCategoryTree(c, allCategories));
    }

    public async Task UpdateCategoryAsync(int categoryId, UpdateCategoryRequest request)
    {
        var category = await _categoryRepository.GetByIdAsync(categoryId);
        if (category == null) throw new KeyNotFoundException($"Category with ID {categoryId} not found");

        if (request.Name != null) category.Name = request.Name;
        if (request.Description != null) category.Description = request.Description;
        if (request.Order != null) category.Order = request.Order.Value;
        if (request.ParentCategoryId != null && request.ParentCategoryId.Value != categoryId)
            category.ParentCategoryId = request.ParentCategoryId;

        await _categoryRepository.UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteCategoryAsync(int categoryId)
    {
        var category = await _categoryRepository.AsQueryable()
            .Include(c => c.ChildCategories)
            .Include(c => c.Designs)
            .FirstOrDefaultAsync(c => c.Id == categoryId);

        if (category == null) throw new KeyNotFoundException($"Category with ID {categoryId} not found");

        // Recursively delete child categories
        foreach (var child in category.ChildCategories.ToList())
        {
            await DeleteCategoryAsync(child.Id);
        }

        // Delete all designs in this category
        foreach (var design in category.Designs.ToList())
        {
            await DeleteDesignAsync(design.Id);
        }

        await _categoryRepository.DeleteAsync(category);
        await _unitOfWork.SaveChangesAsync();
    }

    #endregion

    #region Template Operations

    public async Task<IEnumerable<DesignCategoryDto>> GetCompanyDesignTemplatesAsync(int companyId)
    {
        var templates = await _categoryRepository.AsQueryable()
            .Where(c => c.CompanyId == companyId && c.ProjectId == null && c.ParentCategoryId == null)
            .Include(c => c.ChildCategories)
            .Include(c => c.Designs)
            .OrderBy(c => c.Order)
            .ToListAsync();

        return templates.Select(MapCategoryToDto);
    }

    public async Task ImportDesignTemplateAsync(int templateId, int projectId)
    {
        var template = await _categoryRepository.AsQueryable()
            .Include(t => t.ChildCategories)
            .Include(t => t.Designs)
            .FirstOrDefaultAsync(t => t.Id == templateId);

        if (template == null) throw new KeyNotFoundException($"Template with ID {templateId} not found");

        var companyId = _companyContext.CompanyId ?? 0;
        var oldToNewCategoryMap = new Dictionary<int, int>();
        var oldToNewDesignMap = new Dictionary<int, int>();

        // Import root categories and their children
        var rootTemplate = await _categoryRepository.AsQueryable()
            .Where(c => c.Id == templateId)
            .Include(c => c.ChildCategories)
            .FirstOrDefaultAsync();

        if (rootTemplate != null)
        {
            await ImportCategoryTreeAsync(rootTemplate, null, projectId, companyId, oldToNewCategoryMap, oldToNewDesignMap);
        }
    }

    private async Task ImportCategoryTreeAsync(
        DesignCategory template,
        int? parentNewId,
        int projectId,
        int companyId,
        Dictionary<int, int> categoryMap,
        Dictionary<int, int> designMap)
    {
        // Create new category
        var newCategory = new DesignCategory
        {
            Name = template.Name,
            Description = template.Description,
            Order = template.Order,
            ParentCategoryId = parentNewId,
            ProjectId = projectId,
            CompanyId = companyId
        };

        await _categoryRepository.AddAsync(newCategory);
        await _unitOfWork.SaveChangesAsync();

        categoryMap[template.Id] = newCategory.Id;

        // Import designs in this category
        foreach (var design in template.Designs)
        {
            var newDesign = new Design
            {
                ProjectId = projectId,
                Name = design.Name,
                Description = design.Description,
                CategoryId = newCategory.Id,
                Status = design.Status,
                CompanyId = companyId,
                CreatedByUserId = _companyContext.CurrentUserId,
                Version = design.Version,
                FileUrl = design.FileUrl,
                FileName = design.FileName,
                FileSize = design.FileSize,
                FileType = design.FileType,
                OriginalFileName = design.OriginalFileName,
                ChangeNotes = $"Imported from template: {design.ChangeNotes}"
            };

            await _designRepository.AddAsync(newDesign);
            designMap[design.Id] = newDesign.Id;
        }

        await _unitOfWork.SaveChangesAsync();

        // Import child categories
        foreach (var child in template.ChildCategories)
        {
            await ImportCategoryTreeAsync(child, newCategory.Id, projectId, companyId, categoryMap, designMap);
        }
    }

    #endregion

    #region Mapping Methods

    private DesignDto MapToDto(Design design)
    {
        return new DesignDto
        {
            Id = design.Id,
            ProjectId = design.ProjectId,
            Name = design.Name,
            Description = design.Description,
            CategoryId = design.CategoryId,
            CategoryName = design.Category?.Name,
            Status = design.Status,
            Version = design.Version,
            FileUrl = design.FileUrl,
            FileName = design.FileName,
            OriginalFileName = design.OriginalFileName,
            FileSize = design.FileSize,
            FileType = design.FileType,
            CreatedByUserId = design.CreatedByUserId,
            CreatedByUserName = design.CreatedByUser?.FullName ?? "Unknown",
            CreatedAt = design.CreatedAt,
            UpdatedAt = design.UpdatedAt,
            VersionCount = design.Versions?.Count ?? 0,
            ChangeNotes = design.ChangeNotes
        };
    }

    private DesignCategoryDto MapCategoryToDto(DesignCategory category)
    {
        return new DesignCategoryDto
        {
            Id = category.Id,
            CompanyId = category.CompanyId,
            ProjectId = category.ProjectId ?? 0,
            Name = category.Name,
            Description = category.Description,
            Order = category.Order,
            ParentCategoryId = category.ParentCategoryId,
            ChildCategories = new List<DesignCategoryDto>(),
            Designs = new List<DesignDto>(),
            DesignCount = category.Designs?.Count ?? 0
        };
    }

    private DesignCategoryDto BuildCategoryTree(DesignCategory category, List<DesignCategory> allCategories)
    {
        var dto = MapCategoryToDto(category);
        
        // Map designs
        dto.Designs = category.Designs?.Select(MapToDto).ToList() ?? new List<DesignDto>();
        
        // Build children recursively
        var children = allCategories.Where(c => c.ParentCategoryId == category.Id).OrderBy(c => c.Order).ToList();
        dto.ChildCategories = children.Select(c => BuildCategoryTree(c, allCategories)).ToList();
        dto.DesignCount = dto.Designs.Count + dto.ChildCategories.Sum(c => c.DesignCount);

        return dto;
    }

    #endregion
}
