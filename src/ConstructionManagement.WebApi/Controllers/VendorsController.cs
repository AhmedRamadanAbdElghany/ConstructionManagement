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

        // GET: api/vendors/invoices/pending
        [HttpGet("invoices/pending")]
        public async Task<ActionResult<IEnumerable<VendorInvoiceDto>>> GetPendingInvoices()
        {
            var invoices = await _vendorService.GetPendingInvoicesAsync();
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
    }
}
