using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubcontractorController : ControllerBase
    {
        private readonly ISubcontractorService _subcontractorService;

        public SubcontractorController(ISubcontractorService subcontractorService)
        {
            _subcontractorService = subcontractorService;
        }

        #region Subcontractor Endpoints

        /// <summary>
        /// Get all subcontractors for the current company
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubcontractorDto>>> GetSubcontractors()
        {
            var subcontractors = await _subcontractorService.GetSubcontractorsAsync();
            return Ok(subcontractors);
        }

        /// <summary>
        /// Get subcontractor summary/dashboard
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<SubcontractorSummaryDto>> GetSummary()
        {
            var summary = await _subcontractorService.GetSummaryAsync();
            return Ok(summary);
        }

        /// <summary>
        /// Get top rated subcontractors
        /// </summary>
        [HttpGet("top-rated")]
        public async Task<ActionResult<IEnumerable<SubcontractorDto>>> GetTopRated([FromQuery] int count = 5)
        {
            var subcontractors = await _subcontractorService.GetTopRatedSubcontractorsAsync(count);
            return Ok(subcontractors);
        }

        /// <summary>
        /// Get subcontractors by trade specialty
        /// </summary>
        [HttpGet("by-trade/{trade}")]
        public async Task<ActionResult<IEnumerable<SubcontractorDto>>> GetByTrade(string trade)
        {
            var subcontractors = await _subcontractorService.GetSubcontractorsByTradeAsync(trade);
            return Ok(subcontractors);
        }

        /// <summary>
        /// Get subcontractors with expiring insurance
        /// </summary>
        [HttpGet("expiring-insurance")]
        public async Task<ActionResult<IEnumerable<SubcontractorDto>>> GetExpiringInsurance([FromQuery] int daysAhead = 30)
        {
            var subcontractors = await _subcontractorService.GetSubcontractorsWithExpiringInsuranceAsync(daysAhead);
            return Ok(subcontractors);
        }

        /// <summary>
        /// Get a specific subcontractor by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<SubcontractorDto>> GetSubcontractor(int id)
        {
            var subcontractor = await _subcontractorService.GetSubcontractorByIdAsync(id);
            if (subcontractor == null)
                return NotFound();

            return Ok(subcontractor);
        }

        /// <summary>
        /// Create a new subcontractor
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<SubcontractorDto>> CreateSubcontractor([FromBody] CreateSubcontractorRequest request)
        {
            var subcontractor = await _subcontractorService.CreateSubcontractorAsync(request);
            return CreatedAtAction(nameof(GetSubcontractor), new { id = subcontractor.Id }, subcontractor);
        }

        /// <summary>
        /// Update a subcontractor
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<SubcontractorDto>> UpdateSubcontractor(int id, [FromBody] UpdateSubcontractorRequest request)
        {
            var subcontractor = await _subcontractorService.UpdateSubcontractorAsync(id, request);
            return Ok(subcontractor);
        }

        /// <summary>
        /// Delete a subcontractor
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteSubcontractor(int id)
        {
            var result = await _subcontractorService.DeleteSubcontractorAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Approve a subcontractor
        /// </summary>
        [HttpPost("{id}/approve")]
        public async Task<ActionResult<SubcontractorDto>> ApproveSubcontractor(int id, [FromBody] ApproveSubcontractorRequest request)
        {
            var subcontractor = await _subcontractorService.ApproveSubcontractorAsync(id, request);
            return Ok(subcontractor);
        }

        #endregion

        #region Contract Endpoints

        /// <summary>
        /// Get all active contracts
        /// </summary>
        [HttpGet("contracts/active")]
        public async Task<ActionResult<IEnumerable<SubcontractorContractDto>>> GetActiveContracts()
        {
            var contracts = await _subcontractorService.GetActiveContractsAsync();
            return Ok(contracts);
        }

        /// <summary>
        /// Get contracts for a specific subcontractor
        /// </summary>
        [HttpGet("{subcontractorId}/contracts")]
        public async Task<ActionResult<IEnumerable<SubcontractorContractDto>>> GetContracts(int subcontractorId)
        {
            var contracts = await _subcontractorService.GetContractsAsync(subcontractorId);
            return Ok(contracts);
        }

        /// <summary>
        /// Get a specific contract by ID
        /// </summary>
        [HttpGet("contract/{id}")]
        public async Task<ActionResult<SubcontractorContractDto>> GetContract(int id)
        {
            var contract = await _subcontractorService.GetContractByIdAsync(id);
            if (contract == null)
                return NotFound();

            return Ok(contract);
        }

        /// <summary>
        /// Create a new contract
        /// </summary>
        [HttpPost("contracts")]
        public async Task<ActionResult<SubcontractorContractDto>> CreateContract([FromBody] CreateContractRequest request)
        {
            var contract = await _subcontractorService.CreateContractAsync(request);
            return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, contract);
        }

        /// <summary>
        /// Update a contract
        /// </summary>
        [HttpPut("contract/{id}")]
        public async Task<ActionResult<SubcontractorContractDto>> UpdateContract(int id, [FromBody] UpdateContractRequest request)
        {
            var contract = await _subcontractorService.UpdateContractAsync(id, request);
            return Ok(contract);
        }

        /// <summary>
        /// Delete a contract
        /// </summary>
        [HttpDelete("contract/{id}")]
        public async Task<ActionResult> DeleteContract(int id)
        {
            var result = await _subcontractorService.DeleteContractAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Update contract status
        /// </summary>
        [HttpPatch("contract/{id}/status")]
        public async Task<ActionResult<SubcontractorContractDto>> UpdateContractStatus(int id, [FromBody] ContractStatusUpdateRequest request)
        {
            var contract = await _subcontractorService.UpdateContractStatusAsync(id, request);
            return Ok(contract);
        }

        #endregion

        #region Payment Endpoints

        /// <summary>
        /// Get pending payments
        /// </summary>
        [HttpGet("payments/pending")]
        public async Task<ActionResult<IEnumerable<SubcontractorPaymentDto>>> GetPendingPayments()
        {
            var payments = await _subcontractorService.GetPendingPaymentsAsync();
            return Ok(payments);
        }

        /// <summary>
        /// Get payments for a specific subcontractor
        /// </summary>
        [HttpGet("{subcontractorId}/payments")]
        public async Task<ActionResult<IEnumerable<SubcontractorPaymentDto>>> GetPayments(int subcontractorId)
        {
            var payments = await _subcontractorService.GetPaymentsAsync(subcontractorId);
            return Ok(payments);
        }

        /// <summary>
        /// Get a specific payment by ID
        /// </summary>
        [HttpGet("payment/{id}")]
        public async Task<ActionResult<SubcontractorPaymentDto>> GetPayment(int id)
        {
            var payment = await _subcontractorService.GetPaymentByIdAsync(id);
            if (payment == null)
                return NotFound();

            return Ok(payment);
        }

        /// <summary>
        /// Create a new payment
        /// </summary>
        [HttpPost("payments")]
        public async Task<ActionResult<SubcontractorPaymentDto>> CreatePayment([FromBody] CreatePaymentRequest request)
        {
            var payment = await _subcontractorService.CreatePaymentAsync(request);
            return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
        }

        /// <summary>
        /// Update payment status
        /// </summary>
        [HttpPatch("payment/{id}/status")]
        public async Task<ActionResult<SubcontractorPaymentDto>> UpdatePaymentStatus(int id, [FromBody] UpdatePaymentStatusRequest request)
        {
            var payment = await _subcontractorService.UpdatePaymentStatusAsync(id, request);
            return Ok(payment);
        }

        #endregion

        #region Rating Endpoints

        /// <summary>
        /// Get ratings for a specific subcontractor
        /// </summary>
        [HttpGet("{subcontractorId}/ratings")]
        public async Task<ActionResult<IEnumerable<SubcontractorRatingDto>>> GetRatings(int subcontractorId)
        {
            var ratings = await _subcontractorService.GetRatingsAsync(subcontractorId);
            return Ok(ratings);
        }

        /// <summary>
        /// Get rating summary for a subcontractor
        /// </summary>
        [HttpGet("{subcontractorId}/ratings/summary")]
        public async Task<ActionResult<RatingSummaryDto>> GetRatingSummary(int subcontractorId)
        {
            var summary = await _subcontractorService.GetRatingSummaryAsync(subcontractorId);
            return Ok(summary);
        }

        /// <summary>
        /// Get a specific rating by ID
        /// </summary>
        [HttpGet("rating/{id}")]
        public async Task<ActionResult<SubcontractorRatingDto>> GetRating(int id)
        {
            var rating = await _subcontractorService.GetRatingByIdAsync(id);
            if (rating == null)
                return NotFound();

            return Ok(rating);
        }

        /// <summary>
        /// Create a new rating
        /// </summary>
        [HttpPost("ratings")]
        public async Task<ActionResult<SubcontractorRatingDto>> CreateRating([FromBody] CreateRatingRequest request)
        {
            var rating = await _subcontractorService.CreateRatingAsync(request);
            return CreatedAtAction(nameof(GetRating), new { id = rating.Id }, rating);
        }

        /// <summary>
        /// Finalize a rating
        /// </summary>
        [HttpPost("rating/{id}/finalize")]
        public async Task<ActionResult<SubcontractorRatingDto>> FinalizeRating(int id)
        {
            var rating = await _subcontractorService.FinalizeRatingAsync(id);
            return Ok(rating);
        }

        #endregion
    }
}
