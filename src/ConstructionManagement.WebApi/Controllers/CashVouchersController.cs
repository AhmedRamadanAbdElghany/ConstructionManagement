using ConstructionManagement.Application.DTOs.CashVoucher;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CashVouchersController : ControllerBase
    {
        private readonly ICashVoucherService _cashVoucherService;

        public CashVouchersController(ICashVoucherService cashVoucherService)
        {
            _cashVoucherService = cashVoucherService;
        }

        private int GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userId, out int id) ? id : 0;
        }

        // GET: api/cashvouchers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CashVoucherDto>>> GetVouchers()
        {
            var vouchers = await _cashVoucherService.GetVouchersAsync();
            return Ok(vouchers);
        }

        // GET: api/cashvouchers/summary
        [HttpGet("summary")]
        public async Task<ActionResult<CashVoucherSummary>> GetSummary()
        {
            var summary = await _cashVoucherService.GetSummaryAsync();
            return Ok(summary);
        }

        // GET: api/cashvouchers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CashVoucherDto>> GetVoucher(int id)
        {
            var voucher = await _cashVoucherService.GetVoucherByIdAsync(id);
            if (voucher == null)
                return NotFound();
            return Ok(voucher);
        }

        // GET: api/cashvouchers/pending
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<CashVoucherDto>>> GetPendingVouchers()
        {
            var vouchers = await _cashVoucherService.GetPendingVouchersAsync();
            return Ok(vouchers);
        }

        // GET: api/cashvouchers/worker/5
        [HttpGet("worker/{workerUserId}")]
        public async Task<ActionResult<IEnumerable<CashVoucherDto>>> GetWorkerVouchers(int workerUserId)
        {
            var vouchers = await _cashVoucherService.GetVouchersByWorkerAsync(workerUserId);
            return Ok(vouchers);
        }

        // POST: api/cashvouchers
        [HttpPost]
        public async Task<ActionResult<CashVoucherDto>> CreateVoucher([FromBody] CreateCashVoucherRequest request)
        {
            var createdByUserId = GetCurrentUserId();
            var voucher = await _cashVoucherService.CreateVoucherAsync(request, createdByUserId);
            return CreatedAtAction(nameof(GetVoucher), new { id = voucher.Id }, voucher);
        }

        // POST: api/cashvouchers/5/review
        [HttpPost("{id}/review")]
        public async Task<ActionResult<CashVoucherDto>> ReviewVoucher(int id, [FromBody] ReviewCashVoucherRequest request)
        {
            var reviewerId = GetCurrentUserId();
            var voucher = await _cashVoucherService.ReviewVoucherAsync(id, request, reviewerId);
            return Ok(voucher);
        }
    }
}
