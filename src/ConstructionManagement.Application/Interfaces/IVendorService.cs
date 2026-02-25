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

        // Marketplace Features
        Task<(IEnumerable<VendorProductDto> Products, int TotalCount)> SearchProductsAsync(
            int? categoryId, string? searchTerm, decimal? minPrice, decimal? maxPrice, 
            int? vendorId, string? sortBy, int page, int pageSize);
        Task<VendorProductDetailDto?> GetProductByIdAsync(int productId);
        Task<(IEnumerable<VendorProductDto> Products, int TotalCount)> GetProductsByCategoryAsync(
            int categoryId, int page, int pageSize);
        Task<IEnumerable<NearbyVendorDto>> GetNearbyVendorsAsync(
            double latitude, double longitude, double radiusKm, int? categoryId);
        Task<VendorProfileDto?> GetVendorProfileAsync(int vendorId);
        Task<(IEnumerable<VendorProductDto> Products, int TotalCount)> GetVendorProductsAsync(
            int vendorId, int? categoryId, int page, int pageSize);
        Task<MarketplaceVendorStatsDto> GetVendorStatsAsync(int vendorId);
        Task<(IEnumerable<VendorReviewDto> Reviews, int TotalCount)> GetVendorReviewsAsync(
            int vendorId, int page, int pageSize);
        Task<VendorReviewDto> CreateReviewAsync(int userId, int orderId, CreateVendorReviewDto dto);
        Task<VendorReviewDto?> GetReviewByIdAsync(int reviewId);

        // Vendor Dashboard & Statistics (Feature 1)
        Task<IEnumerable<VendorWithStatsDto>> GetVendorsWithStatsAsync();
        Task<VendorDashboardDto> GetVendorDashboardAsync();
        Task<IEnumerable<VendorProjectDto>> GetVendorProjectsAsync(int vendorId);
        Task<IEnumerable<VendorInvoiceDto>> GetAllVendorBillsAsync(int vendorId);
        Task<IEnumerable<VendorInvoiceDto>> GetFinancialLedgerAsync();

        // Delivery Cost Tiers (Feature 2)
        Task<IEnumerable<DeliveryCostTierDto>> GetDeliveryCostTiersAsync(int productId);
        Task<DeliveryCostTierDto> CreateDeliveryCostTierAsync(CreateDeliveryCostTierRequest request);
        Task<DeliveryCostTierDto> UpdateDeliveryCostTierAsync(int tierId, UpdateDeliveryCostTierRequest request);
        Task<bool> DeleteDeliveryCostTierAsync(int tierId);
        Task<DeliveryCalculationResult> CalculateDeliveryCostAsync(DeliveryCalculationRequest request);
        Task<BulkDeliveryCalculationResult> CalculateBulkDeliveryCostAsync(BulkDeliveryCalculationRequest request);
    }
}
