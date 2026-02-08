using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IInvoiceService
{
    Task<int> CreateInvoiceAsync(int itemId, CreateInvoiceRequest request, int createdByUserId);
    Task<bool> ReviewInvoiceAsync(int invoiceId, ReviewInvoiceRequest request, int reviewerUserId);
    Task<InvoiceDto?> GetInvoiceByIdAsync(int invoiceId);
    Task<List<InvoiceDto>> GetInvoicesForItemAsync(int itemId, string? statusFilter = null);
    Task<List<InvoiceDto>> GetAllInvoicesAsync(int? projectId = null, string? statusFilter = null);
}
