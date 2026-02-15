using ConstructionManagement.Application.DTOs.Vendor;
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IVendorService
    {
        // Vendor operations
        Task<IEnumerable<VendorDto>> GetVendorsAsync();
        Task<VendorDto?> GetVendorByIdAsync(int id);
        Task<VendorDto> CreateVendorAsync(CreateVendorRequest request);
        Task<VendorDto> UpdateVendorAsync(int id, UpdateVendorRequest request);
        Task<bool> DeleteVendorAsync(int id);

        // Invoice operations
        Task<IEnumerable<VendorInvoiceDto>> GetInvoicesByVendorAsync(int vendorId);
        Task<IEnumerable<VendorInvoiceDto>> GetPendingInvoicesAsync();
        Task<VendorInvoiceDto> CreateInvoiceAsync(CreateVendorInvoiceRequest request);
        Task<VendorInvoiceDto> ReviewInvoiceAsync(int invoiceId, ReviewVendorInvoiceRequest request, int reviewerUserId);
        Task<VendorInvoiceDto?> GetInvoiceByIdAsync(int id);
        Task<IEnumerable<VendorInvoiceDto>> GetInvoicesByProjectAsync(int projectId);

        // Summary operations
        Task<IEnumerable<VendorInvoiceSummary>> GetVendorInvoiceSummaryAsync();

        // Advanced Discovery & Analytics
        Task<IEnumerable<PublicVendorDto>> SearchPublicVendorsAsync(VendorSearchRequest request);
        Task<VendorSpendReportDto> GetVendorSpendReportAsync(int? vendorId, DateTime? from, DateTime? to);
        
        // Product Management
        Task<IEnumerable<VendorProductDto>> GetVendorProductsAsync(int vendorId);
        Task<VendorProductDto> AddProductAsync(int vendorId, CreateVendorProductRequest request);
        Task<VendorProductDto> UpdateProductAsync(int productId, UpdateVendorProductRequest request);
        Task<bool> DeleteProductAsync(int productId);

        // Inventory & Transactions
        Task<VendorTransactionDto> RecordTransactionAsync(int vendorId, CreateVendorTransactionRequest request);
        Task<IEnumerable<VendorTransactionDto>> GetVendorTransactionsAsync(int vendorId);
        
        // Profile Management
        Task<VendorDto> UpdateVendorProfileAsync(int userId, UpdateVendorRequest request);
        Task<VendorDto?> GetVendorByUserIdAsync(int userId);
        
        // Stats & Location
        Task<VendorStatsDto?> GetVendorStatsByUserIdAsync(int userId);
        Task UpdateVendorLocationAsync(int userId, double latitude, double longitude);
        Task<VendorDto> ToggleVendorVisibilityAsync(int userId);
    }
}
