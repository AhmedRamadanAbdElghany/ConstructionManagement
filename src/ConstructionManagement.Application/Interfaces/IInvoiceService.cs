using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IInvoiceService
{
    // Basic CRUD operations
    Task<int> CreateInvoiceAsync(CreateInvoiceRequest request, int createdByUserId, int companyId);
    Task<InvoiceDto?> GetInvoiceByIdAsync(int invoiceId);
    Task<bool> UpdateInvoiceAsync(int invoiceId, UpdateInvoiceRequest request, int userId);
    Task<bool> DeleteInvoiceAsync(int invoiceId, int userId);

    // Listing operations
    Task<PagedInvoiceResult> GetInvoicesAsync(InvoiceFilterRequest filter, int companyId);
    Task<List<InvoiceListItemDto>> GetInvoicesForProjectAsync(int projectId, string? invoiceType = null, string? status = null);
    Task<List<InvoiceListItemDto>> GetInvoicesForItemAsync(int projectItemId);
    Task<List<InvoiceListItemDto>> GetPendingInvoicesAsync(int companyId);

    // Review/Approval operations
    Task<bool> ReviewInvoiceAsync(int invoiceId, ReviewInvoiceRequest request, int reviewerUserId);
    Task<bool> CanUserApproveInvoiceAsync(int userId, int invoiceId);

    // Image operations
    Task<int> AddInvoiceImageAsync(int invoiceId, string imagePath, string? originalFileName, long? fileSize, string? contentType, string? description = null);
    Task<bool> RemoveInvoiceImageAsync(int invoiceId, int imageId);
    Task<bool> ReorderInvoiceImagesAsync(int invoiceId, Dictionary<int, int> imageOrder);

    // Statistics
    Task<InvoiceStatisticsDto> GetInvoiceStatisticsAsync(int? projectId = null, int? companyId = null);

    // Legacy methods for backward compatibility
    [Obsolete("Use CreateInvoiceAsync with companyId parameter")]
    Task<int> CreateInvoiceAsync(int itemId, CreateInvoiceRequest request, int createdByUserId);
    [Obsolete("Use GetInvoicesForItemAsync instead")]
    Task<List<InvoiceDto>> GetInvoicesForItemAsync(int itemId, string? statusFilter = null);
    [Obsolete("Use GetInvoicesAsync with filter instead")]
    Task<List<InvoiceDto>> GetAllInvoicesAsync(int? projectId = null, string? statusFilter = null);
}
