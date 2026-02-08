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

        // Summary operations
        Task<IEnumerable<VendorInvoiceSummary>> GetVendorInvoiceSummaryAsync();
    }
}
