using ConstructionManagement.Application.DTOs.Vendor;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VendorsController : ControllerBase
    {
        private readonly IVendorService _vendorService;

        public VendorsController(IVendorService vendorService)
        {
            _vendorService = vendorService;
        }

        private int GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userId, out int id) ? id : 0;
        }

        // GET: api/vendors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VendorDto>>> GetVendors()
        {
            var vendors = await _vendorService.GetVendorsAsync();
            return Ok(vendors);
        }

        // GET: api/vendors/summary
        [HttpGet("summary")]
        public async Task<ActionResult<IEnumerable<VendorInvoiceSummary>>> GetVendorSummary()
        {
            var summary = await _vendorService.GetVendorInvoiceSummaryAsync();
            return Ok(summary);
        }

        // GET: api/vendors/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VendorDto>> GetVendor(int id)
        {
            var vendor = await _vendorService.GetVendorByIdAsync(id);
            if (vendor == null)
                return NotFound();

            return Ok(vendor);
        }

        // POST: api/vendors
        [HttpPost]
        public async Task<ActionResult<VendorDto>> CreateVendor([FromBody] CreateVendorRequest request)
        {
            var vendor = await _vendorService.CreateVendorAsync(request);
            return CreatedAtAction(nameof(GetVendor), new { id = vendor.Id }, vendor);
        }

        // PUT: api/vendors/5
        [HttpPut("{id}")]
        public async Task<ActionResult<VendorDto>> UpdateVendor(int id, [FromBody] UpdateVendorRequest request)
        {
            var vendor = await _vendorService.UpdateVendorAsync(id, request);
            return Ok(vendor);
        }

        // DELETE: api/vendors/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVendor(int id)
        {
            await _vendorService.DeleteVendorAsync(id);
            return NoContent();
        }

        // GET: api/vendors/5/invoices
        [HttpGet("{vendorId}/invoices")]
        public async Task<ActionResult<IEnumerable<VendorInvoiceDto>>> GetVendorInvoices(int vendorId)
        {
            var invoices = await _vendorService.GetInvoicesByVendorAsync(vendorId);
            return Ok(invoices);
        }

        [HttpGet("invoices/pending")]
        public async Task<ActionResult<IEnumerable<VendorInvoiceDto>>> GetPendingInvoices()
        {
            var invoices = await _vendorService.GetPendingInvoicesAsync();
            return Ok(invoices);
        }

        // GET: api/vendors/projects/5/invoices
        [HttpGet("projects/{projectId}/invoices")]
        public async Task<ActionResult<IEnumerable<VendorInvoiceDto>>> GetProjectInvoices(int projectId)
        {
            var invoices = await _vendorService.GetInvoicesByProjectAsync(projectId);
            return Ok(invoices);
        }

        // GET: api/vendors/invoices/5
        [HttpGet("invoices/{id}")]
        public async Task<ActionResult<VendorInvoiceDto>> GetInvoice(int id)
        {
            var invoice = await _vendorService.GetInvoiceByIdAsync(id);
            if (invoice == null)
                return NotFound();

            return Ok(invoice);
        }

        // POST: api/vendors/invoices
        [HttpPost("invoices")]
        public async Task<ActionResult<VendorInvoiceDto>> CreateInvoice([FromForm] CreateVendorInvoiceRequest request)
        {
            request.CreatedByUserId = GetCurrentUserId();
            var invoice = await _vendorService.CreateInvoiceAsync(request);
            return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
        }

        // POST: api/vendors/invoices/5/review
        [HttpPost("invoices/{id}/review")]
        public async Task<ActionResult<VendorInvoiceDto>> ReviewInvoice(int id, [FromBody] ReviewVendorInvoiceRequest request)
        {
            var reviewerId = GetCurrentUserId();
            var invoice = await _vendorService.ReviewInvoiceAsync(id, request, reviewerId);
            return Ok(invoice);
        }

        // --- Advanced Discovery & Analytics ---

        // GET: api/vendors/search
        [HttpGet("search")]
        [AllowAnonymous] // Allow public search
        public async Task<ActionResult<IEnumerable<PublicVendorDto>>> SearchVendors([FromQuery] VendorSearchRequest request)
        {
            var vendors = await _vendorService.SearchPublicVendorsAsync(request);
            return Ok(vendors);
        }

        // GET: api/vendors/analytics
        [HttpGet("analytics")]
        public async Task<ActionResult<VendorSpendReportDto>> GetAnalytics([FromQuery] int? vendorId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var report = await _vendorService.GetVendorSpendReportAsync(vendorId, from, to);
            return Ok(report);
        }

        // --- Product Management ---

        // GET: api/vendors/{vendorId}/products
        [HttpGet("{vendorId}/products")]
        public async Task<ActionResult<IEnumerable<VendorProductDto>>> GetVendorProducts(int vendorId)
        {
            var products = await _vendorService.GetVendorProductsAsync(vendorId);
            return Ok(products);
        }

        // POST: api/vendors/{vendorId}/products
        [HttpPost("{vendorId}/products")]
        public async Task<ActionResult<VendorProductDto>> AddProduct(int vendorId, [FromBody] CreateVendorProductRequest request)
        {
            var product = await _vendorService.AddProductAsync(vendorId, request);
            return Ok(product);
        }

        // DELETE: api/vendors/products/{productId}
        [HttpDelete("products/{productId}")]
        public async Task<IActionResult> DeleteProduct(int productId)
        {
            await _vendorService.DeleteProductAsync(productId);
            return NoContent();
        }

        // --- Profile Management (for WarehouseOwners) ---

        // GET: api/vendors/profile
        [HttpGet("profile")]
        public async Task<ActionResult<VendorDto>> GetMyProfile()
        {
            var userId = GetCurrentUserId();
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null) return NotFound("Vendor profile not found");
            return Ok(vendor);
        }

        // PUT: api/vendors/profile
        [HttpPut("profile")]
        public async Task<ActionResult<VendorDto>> UpdateMyProfile([FromBody] UpdateVendorRequest request)
        {
            var userId = GetCurrentUserId();
            var vendor = await _vendorService.UpdateVendorProfileAsync(userId, request);
            return Ok(vendor);
        }

        // --- Inventory Management (for Inventory Owners) ---

        [HttpGet("my-products")]
        public async Task<ActionResult<IEnumerable<VendorProductDto>>> GetMyProducts()
        {
            var userId = GetCurrentUserId();
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null) return NotFound("Vendor profile not found");
            
            var products = await _vendorService.GetVendorProductsAsync(vendor.Id);
            return Ok(products);
        }

        [HttpPost("my-products")]
        public async Task<ActionResult<VendorProductDto>> AddMyProduct([FromBody] CreateVendorProductRequest request)
        {
            var userId = GetCurrentUserId();
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null) return NotFound("Vendor profile not found");

            var product = await _vendorService.AddProductAsync(vendor.Id, request);
            return Ok(product);
        }

        [HttpPut("my-products/{id}")]
        public async Task<ActionResult<VendorProductDto>> UpdateMyProduct(int id, [FromBody] UpdateVendorProductRequest request)
        {
            // Ideally we check ownership inside service or here
            var userId = GetCurrentUserId();
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null) return NotFound("Vendor profile not found");

            // TODO: Service level check that product belongs to this vendor
            var product = await _vendorService.UpdateProductAsync(id, request);
            return Ok(product);
        }

        [HttpPost("record-transaction")]
        public async Task<ActionResult<VendorTransactionDto>> RecordTransaction([FromBody] CreateVendorTransactionRequest request)
        {
            var userId = GetCurrentUserId();
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null) return NotFound("Vendor profile not found");

            var transaction = await _vendorService.RecordTransactionAsync(vendor.Id, request);
            return Ok(transaction);
        }

        [HttpGet("my-transactions")]
        public async Task<ActionResult<IEnumerable<VendorTransactionDto>>> GetMyTransactions()
        {
            var userId = GetCurrentUserId();
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null) return NotFound("Vendor profile not found");

            var transactions = await _vendorService.GetVendorTransactionsAsync(vendor.Id);
            return Ok(transactions);
        }

        // GET: api/vendors/my-orders
        [HttpGet("my-orders")]
        public async Task<ActionResult<IEnumerable<VendorInvoiceDto>>> GetMyOrders()
        {
            var userId = GetCurrentUserId();
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null) return NotFound("Vendor profile not found");

            var invoices = await _vendorService.GetInvoicesByVendorAsync(vendor.Id);
            return Ok(invoices);
        }

        // GET: api/vendors/my-stats
        [HttpGet("my-stats")]
        public async Task<ActionResult<VendorStatsDto>> GetMyStats()
        {
            var userId = GetCurrentUserId();
            var stats = await _vendorService.GetVendorStatsByUserIdAsync(userId);
            if (stats == null) return NotFound("Vendor profile not found");
            return Ok(stats);
        }
        // POST: api/vendors/my-location
        [HttpPost("my-location")]
        public async Task<IActionResult> UpdateMyLocation([FromBody] UpdateVendorLocationRequest request)
        {
            var userId = GetCurrentUserId();
            await _vendorService.UpdateVendorLocationAsync(userId, request.Latitude, request.Longitude);
            return Ok();
        }

        // PATCH: api/vendors/my-visibility
        [HttpPatch("my-visibility")]
        public async Task<ActionResult<VendorDto>> ToggleMyVisibility()
        {
            var userId = GetCurrentUserId();
            var vendor = await _vendorService.ToggleVendorVisibilityAsync(userId);
            return Ok(vendor);
        }
    }
}
