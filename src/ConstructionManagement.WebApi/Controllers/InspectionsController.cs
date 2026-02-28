using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;

namespace ConstructionManagement.WebApi.Controllers
{
    /// <summary>
    /// Controller for inspection management
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InspectionsController : BaseApiController
    {
        private readonly IInspectionService _inspectionService;
        private readonly ILogger<InspectionsController> _logger;

        public InspectionsController(
            IInspectionService inspectionService,
            ICompanyFeatureService featureService,
            ILogger<InspectionsController> logger) : base(featureService)
        {
            _inspectionService = inspectionService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        private int? GetCompanyId()
        {
            // Match the claim name used in JWT token generation (lowercase 'd' in companyId)
            var companyIdClaim = User.FindFirst("companyId")?.Value;
            return int.TryParse(companyIdClaim, out var companyId) ? companyId : null;
        }

        #region Inspection Requests

        /// <summary>
        /// Create a new inspection request
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(InspectionRequestDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionRequestDto>> CreateRequest([FromBody] CreateInspectionRequestDto dto)
        {
            // Check if inspections feature is enabled
            if (!await IsFeatureEnabledAsync("EnableInspections"))
            {
                return FeatureDisabled<InspectionRequestDto>("Inspections");
            }

            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.CreateRequestAsync(userId, dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating inspection request");
                return StatusCode(500, "An error occurred while creating the inspection request");
            }
        }

        /// <summary>
        /// Get inspection request by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(InspectionRequestDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InspectionRequestDto>> GetById(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.GetRequestByIdAsync(id, userId);
                if (result == null)
                {
                    return NotFound();
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inspection request {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the inspection request");
            }
        }

        /// <summary>
        /// Get client's inspection requests
        /// </summary>
        [HttpGet("my-requests")]
        [ProducesResponseType(typeof(InspectionRequestPagedResultDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<InspectionRequestPagedResultDto>> GetMyRequests([FromQuery] InspectionFilterDto filter)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.GetClientRequestsAsync(userId, filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting client inspection requests");
                return StatusCode(500, "An error occurred while retrieving inspection requests");
            }
        }

        /// <summary>
        /// Get company's inspection requests
        /// </summary>
        [HttpGet("company/{companyId}")]
        [ProducesResponseType(typeof(InspectionRequestPagedResultDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<InspectionRequestPagedResultDto>> GetCompanyRequests(int companyId, [FromQuery] InspectionFilterDto filter)
        {
            try
            {
                var userCompanyId = GetCompanyId();
                if (userCompanyId != companyId)
                {
                    return Forbid();
                }

                var result = await _inspectionService.GetCompanyRequestsAsync(companyId, filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting company inspection requests");
                return StatusCode(500, "An error occurred while retrieving inspection requests");
            }
        }

        /// <summary>
        /// Update inspection request
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(InspectionRequestDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InspectionRequestDto>> UpdateRequest(int id, [FromBody] UpdateInspectionRequestDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.UpdateRequestAsync(id, userId, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating inspection request {Id}", id);
                return StatusCode(500, "An error occurred while updating the inspection request");
            }
        }

        /// <summary>
        /// Cancel inspection request
        /// </summary>
        [HttpPost("{id}/cancel")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> CancelRequest(int id, [FromBody] CancelRequestDto? dto = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.CancelRequestAsync(id, userId, dto?.Reason);
                if (!result)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling inspection request {Id}", id);
                return StatusCode(500, "An error occurred while cancelling the inspection request");
            }
        }

        #endregion

        #region Time Slots

        /// <summary>
        /// Add time slots to inspection
        /// </summary>
        [HttpPost("{id}/time-slots")]
        [ProducesResponseType(typeof(List<InspectionTimeSlotDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<List<InspectionTimeSlotDto>>> AddTimeSlots(int id, [FromBody] List<CreateTimeSlotDto> slots)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.AddTimeSlotsAsync(id, userId, slots);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding time slots to inspection {Id}", id);
                return StatusCode(500, "An error occurred while adding time slots");
            }
        }

        /// <summary>
        /// Select a time slot
        /// </summary>
        [HttpPost("{id}/time-slots/{timeSlotId}/select")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> SelectTimeSlot(int id, int timeSlotId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.SelectTimeSlotAsync(id, timeSlotId, userId);
                if (!result)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error selecting time slot {TimeSlotId} for inspection {Id}", timeSlotId, id);
                return StatusCode(500, "An error occurred while selecting the time slot");
            }
        }

        /// <summary>
        /// Remove a time slot
        /// </summary>
        [HttpDelete("{id}/time-slots/{timeSlotId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> RemoveTimeSlot(int id, int timeSlotId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.RemoveTimeSlotAsync(id, timeSlotId, userId);
                if (!result)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing time slot {TimeSlotId} from inspection {Id}", timeSlotId, id);
                return StatusCode(500, "An error occurred while removing the time slot");
            }
        }

        #endregion

        #region Quotes

        /// <summary>
        /// Create a quote for inspection
        /// </summary>
        [HttpPost("{id}/quotes")]
        [ProducesResponseType(typeof(InspectionQuoteDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionQuoteDto>> CreateQuote(int id, [FromBody] CreateInspectionQuoteDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.CreateQuoteAsync(id, userId, dto);
                return CreatedAtAction(nameof(GetQuotes), new { id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating quote for inspection {Id}", id);
                return StatusCode(500, "An error occurred while creating the quote");
            }
        }

        /// <summary>
        /// Get quotes for inspection
        /// </summary>
        [HttpGet("{id}/quotes")]
        [ProducesResponseType(typeof(List<InspectionQuoteDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<InspectionQuoteDto>>> GetQuotes(int id)
        {
            try
            {
                var result = await _inspectionService.GetQuotesAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting quotes for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving quotes");
            }
        }

        /// <summary>
        /// Accept a quote
        /// </summary>
        [HttpPost("{id}/quotes/{quoteId}/accept")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> AcceptQuote(int id, int quoteId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.AcceptQuoteAsync(id, quoteId, userId);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accepting quote {QuoteId} for inspection {Id}", quoteId, id);
                return StatusCode(500, "An error occurred while accepting the quote");
            }
        }

        /// <summary>
        /// Reject a quote
        /// </summary>
        [HttpPost("{id}/quotes/{quoteId}/reject")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> RejectQuote(int id, int quoteId, [FromBody] RespondToQuoteDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.RejectQuoteAsync(id, quoteId, userId, dto.RejectionReason);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting quote {QuoteId} for inspection {Id}", quoteId, id);
                return StatusCode(500, "An error occurred while rejecting the quote");
            }
        }

        #endregion

        #region Session Management

        /// <summary>
        /// Generate QR code for inspection verification
        /// </summary>
        [HttpPost("{id}/qr-code")]
        [ProducesResponseType(typeof(QRCodeResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<QRCodeResponseDto>> GenerateQRCode(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.GenerateQRCodeAsync(id, userId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating QR code for inspection {Id}", id);
                return StatusCode(500, "An error occurred while generating the QR code");
            }
        }

        /// <summary>
        /// Verify inspection start via QR code
        /// </summary>
        [HttpPost("{id}/verify-start")]
        [ProducesResponseType(typeof(InspectionSessionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionSessionDto>> VerifyStart(int id, [FromBody] VerifyInspectionStartDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.VerifyStartAsync(id, userId, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying inspection start for inspection {Id}", id);
                return StatusCode(500, "An error occurred while verifying the inspection start");
            }
        }

        /// <summary>
        /// Start inspection (company side)
        /// </summary>
        [HttpPost("{id}/start")]
        [ProducesResponseType(typeof(InspectionSessionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionSessionDto>> StartInspection(int id, [FromBody] StartInspectionDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.StartInspectionAsync(id, userId, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting inspection {Id}", id);
                return StatusCode(500, "An error occurred while starting the inspection");
            }
        }

        /// <summary>
        /// Approve inspection start request (client side)
        /// </summary>
        [HttpPost("{id}/approve-start")]
        [ProducesResponseType(typeof(InspectionSessionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionSessionDto>> ApproveStart(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.ApproveStartAsync(id, userId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving inspection start for inspection {Id}", id);
                return StatusCode(500, "An error occurred while approving the inspection start");
            }
        }

        /// <summary>
        /// Complete inspection
        /// </summary>
        [HttpPost("{id}/complete")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> CompleteInspection(int id, [FromBody] CompleteInspectionDto? dto = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.CompleteInspectionAsync(id, userId, dto?.Notes);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing inspection {Id}", id);
                return StatusCode(500, "An error occurred while completing the inspection");
            }
        }

        /// <summary>
        /// Get session details
        /// </summary>
        [HttpGet("{id}/session")]
        [ProducesResponseType(typeof(InspectionSessionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InspectionSessionDto>> GetSession(int id)
        {
            try
            {
                var result = await _inspectionService.GetSessionAsync(id);
                if (result == null)
                {
                    return NotFound();
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting session for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the session");
            }
        }

        #endregion

        #region Documents

        /// <summary>
        /// Upload document to inspection
        /// </summary>
        [HttpPost("{id}/documents")]
        [ProducesResponseType(typeof(InspectionDocumentDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionDocumentDto>> UploadDocument(int id, [FromForm] UploadDocumentFormDto form)
        {
            try
            {
                var userId = GetCurrentUserId();

                if (form.File == null || form.File.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }

                using var memoryStream = new System.IO.MemoryStream();
                await form.File.CopyToAsync(memoryStream);
                var fileData = memoryStream.ToArray();

                var dto = new UploadInspectionDocumentDto
                {
                    Type = form.Type,
                    Description = form.Description
                };

                var result = await _inspectionService.UploadDocumentAsync(id, userId, dto, fileData, form.File.FileName, form.File.ContentType);
                return CreatedAtAction(nameof(GetDocuments), new { id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading document for inspection {Id}", id);
                return StatusCode(500, "An error occurred while uploading the document");
            }
        }

        /// <summary>
        /// Get documents for inspection
        /// </summary>
        [HttpGet("{id}/documents")]
        [ProducesResponseType(typeof(List<InspectionDocumentDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<InspectionDocumentDto>>> GetDocuments(int id)
        {
            try
            {
                var result = await _inspectionService.GetDocumentsAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting documents for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving documents");
            }
        }

        /// <summary>
        /// Delete document
        /// </summary>
        [HttpDelete("{id}/documents/{documentId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> DeleteDocument(int id, int documentId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.DeleteDocumentAsync(id, documentId, userId);
                if (!result)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document {DocumentId} for inspection {Id}", documentId, id);
                return StatusCode(500, "An error occurred while deleting the document");
            }
        }

        #endregion

        #region Payments

        /// <summary>
        /// Process payment for inspection
        /// </summary>
        [HttpPost("{id}/payment")]
        [ProducesResponseType(typeof(InspectionPaymentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionPaymentDto>> ProcessPayment(int id, [FromBody] PayInspectionDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.ProcessPaymentAsync(id, userId, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment for inspection {Id}", id);
                return StatusCode(500, "An error occurred while processing the payment");
            }
        }

        /// <summary>
        /// Confirm cash payment
        /// </summary>
        [HttpPost("{id}/payment/confirm-cash")]
        [ProducesResponseType(typeof(InspectionPaymentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionPaymentDto>> ConfirmCashPayment(int id, [FromBody] ConfirmCashPaymentDto? dto = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.ConfirmCashPaymentAsync(id, userId, dto ?? new ConfirmCashPaymentDto());
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming cash payment for inspection {Id}", id);
                return StatusCode(500, "An error occurred while confirming the payment");
            }
        }

        /// <summary>
        /// Get payment details
        /// </summary>
        [HttpGet("{id}/payment")]
        [ProducesResponseType(typeof(InspectionPaymentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InspectionPaymentDto>> GetPayment(int id)
        {
            try
            {
                var result = await _inspectionService.GetPaymentAsync(id);
                if (result == null)
                {
                    return NotFound();
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the payment");
            }
        }

        #endregion

        #region Work Requests

        /// <summary>
        /// Create work request from inspection
        /// </summary>
        [HttpPost("{id}/work-request")]
        [ProducesResponseType(typeof(InspectionWorkRequestDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionWorkRequestDto>> CreateWorkRequest(int id, [FromBody] CreateWorkRequestDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.CreateWorkRequestAsync(id, userId, dto);
                return CreatedAtAction(nameof(GetWorkRequest), new { id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating work request for inspection {Id}", id);
                return StatusCode(500, "An error occurred while creating the work request");
            }
        }

        /// <summary>
        /// Get work request for inspection
        /// </summary>
        [HttpGet("{id}/work-request")]
        [ProducesResponseType(typeof(InspectionWorkRequestDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InspectionWorkRequestDto>> GetWorkRequest(int id)
        {
            try
            {
                var request = await _inspectionService.GetRequestByIdAsync(id, GetCurrentUserId());
                return Ok(request?.WorkRequest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting work request for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the work request");
            }
        }

        /// <summary>
        /// Respond to work request
        /// </summary>
        [HttpPost("{id}/work-request/respond")]
        [ProducesResponseType(typeof(InspectionWorkRequestDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionWorkRequestDto>> RespondToWorkRequest(int id, [FromBody] RespondToWorkRequestDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.RespondToWorkRequestAsync(id, userId, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error responding to work request for inspection {Id}", id);
                return StatusCode(500, "An error occurred while responding to the work request");
            }
        }

        /// <summary>
        /// Convert inspection to project
        /// </summary>
        [HttpPost("{id}/convert-to-project")]
        [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<int>> ConvertToProject(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var projectId = await _inspectionService.ConvertToProjectAsync(id, userId);
                return Ok(projectId);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error converting inspection {Id} to project", id);
                return StatusCode(500, "An error occurred while converting to project");
            }
        }

        #endregion

        #region Reviews

        /// <summary>
        /// Create review for inspection
        /// </summary>
        [HttpPost("{id}/review")]
        [ProducesResponseType(typeof(InspectionReviewDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionReviewDto>> CreateReview(int id, [FromBody] CreateInspectionReviewDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.CreateReviewAsync(id, userId, dto);
                return CreatedAtAction(nameof(GetReview), new { id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review for inspection {Id}", id);
                return StatusCode(500, "An error occurred while creating the review");
            }
        }

        /// <summary>
        /// Get review for inspection
        /// </summary>
        [HttpGet("{id}/review")]
        [ProducesResponseType(typeof(InspectionReviewDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InspectionReviewDto>> GetReview(int id)
        {
            try
            {
                var result = await _inspectionService.GetReviewAsync(id);
                if (result == null)
                {
                    return NotFound();
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the review");
            }
        }

        /// <summary>
        /// Respond to review (company)
        /// </summary>
        [HttpPost("{id}/review/respond")]
        [ProducesResponseType(typeof(InspectionReviewDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionReviewDto>> RespondToReview(int id, [FromBody] RespondToReviewDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.RespondToReviewAsync(id, userId, dto.Response);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error responding to review for inspection {Id}", id);
                return StatusCode(500, "An error occurred while responding to the review");
            }
        }

        #endregion

        #region Cost Estimates

        /// <summary>
        /// Create cost estimate for inspection
        /// </summary>
        [HttpPost("{id}/cost-estimate")]
        [ProducesResponseType(typeof(InspectionCostEstimateDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionCostEstimateDto>> CreateCostEstimate(int id, [FromBody] CreateCostEstimateDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.CreateCostEstimateAsync(id, userId, dto);
                return CreatedAtAction(nameof(GetCostEstimate), new { id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating cost estimate for inspection {Id}", id);
                return StatusCode(500, "An error occurred while creating the cost estimate");
            }
        }

        /// <summary>
        /// Get cost estimate for inspection
        /// </summary>
        [HttpGet("{id}/cost-estimate")]
        [ProducesResponseType(typeof(InspectionCostEstimateDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InspectionCostEstimateDto>> GetCostEstimate(int id)
        {
            try
            {
                var result = await _inspectionService.GetCostEstimateAsync(id);
                if (result == null)
                {
                    return NotFound();
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cost estimate for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the cost estimate");
            }
        }

        /// <summary>
        /// Update cost estimate
        /// </summary>
        [HttpPut("{id}/cost-estimate/{estimateId}")]
        [ProducesResponseType(typeof(InspectionCostEstimateDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionCostEstimateDto>> UpdateCostEstimate(int id, int estimateId, [FromBody] CreateCostEstimateDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.UpdateCostEstimateAsync(id, estimateId, userId, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cost estimate for inspection {Id}", id);
                return StatusCode(500, "An error occurred while updating the cost estimate");
            }
        }

        #endregion

        #region Rescheduling

        /// <summary>
        /// Create reschedule request
        /// </summary>
        [HttpPost("{id}/reschedule")]
        [ProducesResponseType(typeof(InspectionRescheduleRequestDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionRescheduleRequestDto>> CreateRescheduleRequest(int id, [FromBody] CreateRescheduleRequestDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.CreateRescheduleRequestAsync(id, userId, dto);
                return CreatedAtAction(nameof(GetRescheduleRequests), new { id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating reschedule request for inspection {Id}", id);
                return StatusCode(500, "An error occurred while creating the reschedule request");
            }
        }

        /// <summary>
        /// Get reschedule requests for inspection
        /// </summary>
        [HttpGet("{id}/reschedule")]
        [ProducesResponseType(typeof(List<InspectionRescheduleRequestDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<InspectionRescheduleRequestDto>>> GetRescheduleRequests(int id)
        {
            try
            {
                var result = await _inspectionService.GetRescheduleRequestsAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reschedule requests for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving reschedule requests");
            }
        }

        /// <summary>
        /// Respond to reschedule request
        /// </summary>
        [HttpPost("{id}/reschedule/{rescheduleId}/respond")]
        [ProducesResponseType(typeof(InspectionRescheduleRequestDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionRescheduleRequestDto>> RespondToReschedule(int id, int rescheduleId, [FromBody] RespondToRescheduleDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.RespondToRescheduleAsync(id, rescheduleId, userId, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error responding to reschedule request for inspection {Id}", id);
                return StatusCode(500, "An error occurred while responding to the reschedule request");
            }
        }

        #endregion

        #region Chat

        /// <summary>
        /// Send chat message
        /// </summary>
        [HttpPost("{id}/chat")]
        [ProducesResponseType(typeof(InspectionChatMessageDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionChatMessageDto>> SendMessage(int id, [FromBody] SendChatMessageDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.SendMessageAsync(id, userId, dto);
                return CreatedAtAction(nameof(GetMessages), new { id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message for inspection {Id}", id);
                return StatusCode(500, "An error occurred while sending the message");
            }
        }

        /// <summary>
        /// Get chat messages
        /// </summary>
        [HttpGet("{id}/chat")]
        [ProducesResponseType(typeof(List<InspectionChatMessageDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<InspectionChatMessageDto>>> GetMessages(int id, [FromQuery] int? afterId = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.GetMessagesAsync(id, userId, afterId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting messages for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving messages");
            }
        }

        /// <summary>
        /// Mark messages as read
        /// </summary>
        [HttpPost("{id}/chat/mark-read")]
        [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
        public async Task<ActionResult<int>> MarkMessagesAsRead(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var count = await _inspectionService.MarkMessagesAsReadAsync(id, userId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking messages as read for inspection {Id}", id);
                return StatusCode(500, "An error occurred while marking messages as read");
            }
        }

        #endregion

        #region Checklists

        /// <summary>
        /// Get checklist templates for company
        /// </summary>
        [HttpGet("checklist-templates")]
        [ProducesResponseType(typeof(List<InspectionChecklistTemplateDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<InspectionChecklistTemplateDto>>> GetChecklistTemplates([FromQuery] int? propertyType = null)
        {
            try
            {
                var companyId = GetCompanyId();
                if (!companyId.HasValue)
                {
                    return Forbid();
                }

                var result = await _inspectionService.GetChecklistTemplatesAsync(companyId.Value, propertyType);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting checklist templates");
                return StatusCode(500, "An error occurred while retrieving checklist templates");
            }
        }

        /// <summary>
        /// Create checklist template
        /// </summary>
        [HttpPost("checklist-templates")]
        [ProducesResponseType(typeof(InspectionChecklistTemplateDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionChecklistTemplateDto>> CreateChecklistTemplate([FromBody] InspectionChecklistTemplateDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.CreateChecklistTemplateAsync(userId, dto);
                return CreatedAtAction(nameof(GetChecklistTemplates), new { }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating checklist template");
                return StatusCode(500, "An error occurred while creating the checklist template");
            }
        }

        /// <summary>
        /// Apply checklist to inspection
        /// </summary>
        [HttpPost("{id}/checklist/{templateId}/apply")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> ApplyChecklist(int id, int templateId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.ApplyChecklistAsync(id, templateId, userId);
                if (!result)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying checklist to inspection {Id}", id);
                return StatusCode(500, "An error occurred while applying the checklist");
            }
        }

        /// <summary>
        /// Submit checklist response
        /// </summary>
        [HttpPost("{id}/checklist/responses")]
        [ProducesResponseType(typeof(InspectionChecklistResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionChecklistResponseDto>> SubmitChecklistResponse(int id, [FromBody] SubmitChecklistResponseDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.SubmitChecklistResponseAsync(id, userId, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting checklist response for inspection {Id}", id);
                return StatusCode(500, "An error occurred while submitting the checklist response");
            }
        }

        /// <summary>
        /// Get checklist responses for inspection
        /// </summary>
        [HttpGet("{id}/checklist/responses")]
        [ProducesResponseType(typeof(List<InspectionChecklistResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<InspectionChecklistResponseDto>>> GetChecklistResponses(int id)
        {
            try
            {
                var result = await _inspectionService.GetChecklistResponsesAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting checklist responses for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving checklist responses");
            }
        }

        #endregion

        #region Team Management

        /// <summary>
        /// Assign team member to inspection
        /// </summary>
        [HttpPost("{id}/team")]
        [ProducesResponseType(typeof(InspectionTeamMemberDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionTeamMemberDto>> AssignTeamMember(int id, [FromBody] AssignTeamMemberDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.AssignTeamMemberAsync(id, userId, dto);
                return CreatedAtAction(nameof(GetTeamMembers), new { id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning team member to inspection {Id}", id);
                return StatusCode(500, "An error occurred while assigning the team member");
            }
        }

        /// <summary>
        /// Get team members for inspection
        /// </summary>
        [HttpGet("{id}/team")]
        [ProducesResponseType(typeof(List<InspectionTeamMemberDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<InspectionTeamMemberDto>>> GetTeamMembers(int id)
        {
            try
            {
                var result = await _inspectionService.GetTeamMembersAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting team members for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving team members");
            }
        }

        /// <summary>
        /// Remove team member from inspection
        /// </summary>
        [HttpDelete("{id}/team/{teamMemberId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> RemoveTeamMember(int id, int teamMemberId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.RemoveTeamMemberAsync(id, teamMemberId, userId);
                if (!result)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing team member from inspection {Id}", id);
                return StatusCode(500, "An error occurred while removing the team member");
            }
        }

        #endregion

        #region Signatures

        /// <summary>
        /// Submit signature
        /// </summary>
        [HttpPost("{id}/signatures")]
        [ProducesResponseType(typeof(InspectionSignatureDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionSignatureDto>> SubmitSignature(int id, [FromBody] SubmitSignatureDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.SubmitSignatureAsync(id, userId, dto);
                return CreatedAtAction(nameof(GetSignatures), new { id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting signature for inspection {Id}", id);
                return StatusCode(500, "An error occurred while submitting the signature");
            }
        }

        /// <summary>
        /// Get signatures for inspection
        /// </summary>
        [HttpGet("{id}/signatures")]
        [ProducesResponseType(typeof(List<InspectionSignatureDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<InspectionSignatureDto>>> GetSignatures(int id)
        {
            try
            {
                var result = await _inspectionService.GetSignaturesAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting signatures for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving signatures");
            }
        }

        #endregion

        #region Reports

        /// <summary>
        /// Generate inspection report
        /// </summary>
        [HttpPost("{id}/report")]
        [ProducesResponseType(typeof(InspectionReportDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InspectionReportDto>> GenerateReport(int id, [FromBody] GenerateReportDto? dto = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.GenerateReportAsync(id, userId, dto ?? new GenerateReportDto());
                return CreatedAtAction(nameof(GetReport), new { id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report for inspection {Id}", id);
                return StatusCode(500, "An error occurred while generating the report");
            }
        }

        /// <summary>
        /// Get report for inspection
        /// </summary>
        [HttpGet("{id}/report")]
        [ProducesResponseType(typeof(InspectionReportDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InspectionReportDto>> GetReport(int id)
        {
            try
            {
                var result = await _inspectionService.GetReportAsync(id);
                if (result == null)
                {
                    return NotFound();
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report for inspection {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the report");
            }
        }

        /// <summary>
        /// Send report to client
        /// </summary>
        [HttpPost("{id}/report/send")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> SendReportToClient(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _inspectionService.SendReportToClientAsync(id, userId);
                if (!result)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending report to client for inspection {Id}", id);
                return StatusCode(500, "An error occurred while sending the report");
            }
        }

        #endregion

        #region Analytics

        /// <summary>
        /// Get inspection analytics for company
        /// </summary>
        [HttpGet("analytics")]
        [ProducesResponseType(typeof(InspectionAnalyticsDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<InspectionAnalyticsDto>> GetAnalytics([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var companyId = GetCompanyId();
                if (!companyId.HasValue)
                {
                    return Forbid();
                }

                var result = await _inspectionService.GetAnalyticsAsync(companyId.Value, fromDate, toDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inspection analytics");
                return StatusCode(500, "An error occurred while retrieving analytics");
            }
        }

        #endregion
    }

    #region Helper DTOs

    public class CancelRequestDto
    {
        public string? Reason { get; set; }
    }

    public class CompleteInspectionDto
    {
        public string? Notes { get; set; }
    }

    public class UploadDocumentFormDto
    {
        public int Type { get; set; }
        public string? Description { get; set; }
        public IFormFile? File { get; set; }
    }

    public class RespondToReviewDto
    {
        public string Response { get; set; } = string.Empty;
    }

    #endregion
}
