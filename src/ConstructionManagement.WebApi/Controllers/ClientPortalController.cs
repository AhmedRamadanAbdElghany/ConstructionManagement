using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientPortalController : ControllerBase
    {
        private readonly IClientPortalService _clientPortalService;
        private readonly ILogger<ClientPortalController> _logger;

        public ClientPortalController(
            IClientPortalService clientPortalService,
            ILogger<ClientPortalController> logger)
        {
            _clientPortalService = clientPortalService;
            _logger = logger;
        }

        #region Client Portal Settings

        /// <summary>
        /// Get client portal settings for company
        /// </summary>
        [HttpGet("settings")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<ClientPortalSettingsDto>> GetClientPortalSettings()
        {
            var companyId = GetCurrentCompanyId();
            var settings = await _clientPortalService.GetClientPortalSettingsAsync(companyId);
            return Ok(settings);
        }

        /// <summary>
        /// Update client portal settings
        /// </summary>
        [HttpPut("settings")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<ClientPortalSettingsDto>> UpdateClientPortalSettings([FromBody] UpdateClientPortalSettingsRequest request)
        {
            var companyId = GetCurrentCompanyId();
            var settings = await _clientPortalService.UpdateClientPortalSettingsAsync(companyId, request);
            return Ok(settings);
        }

        #endregion

        #region Client Users (Admin)

        /// <summary>
        /// Get all client users for company
        /// </summary>
        [HttpGet("clients")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<ClientUserDto>>> GetClientUsers()
        {
            var companyId = GetCurrentCompanyId();
            var clients = await _clientPortalService.GetClientUsersAsync(companyId);
            return Ok(clients);
        }

        /// <summary>
        /// Get client user by ID
        /// </summary>
        [HttpGet("clients/{clientUserId}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<ClientUserDto>> GetClientUser(int clientUserId)
        {
            var client = await _clientPortalService.GetClientUserAsync(clientUserId);
            if (client == null)
                return NotFound(new { message = "Client user not found" });
            return Ok(client);
        }

        /// <summary>
        /// Create new client user
        /// </summary>
        [HttpPost("clients")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<ClientUserDto>> CreateClientUser([FromBody] CreateClientUserRequest request)
        {
            var companyId = GetCurrentCompanyId();
            try
            {
                var client = await _clientPortalService.CreateClientUserAsync(companyId, request);
                return CreatedAtAction(nameof(GetClientUser), new { clientUserId = client.Id }, client);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update client user
        /// </summary>
        [HttpPut("clients/{clientUserId}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<ClientUserDto>> UpdateClientUser(int clientUserId, [FromBody] UpdateClientUserRequest request)
        {
            var client = await _clientPortalService.UpdateClientUserAsync(clientUserId, request);
            if (client == null)
                return NotFound(new { message = "Client user not found" });
            return Ok(client);
        }

        /// <summary>
        /// Delete client user
        /// </summary>
        [HttpDelete("clients/{clientUserId}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> DeleteClientUser(int clientUserId)
        {
            var deleted = await _clientPortalService.DeleteClientUserAsync(clientUserId);
            if (!deleted)
                return NotFound(new { message = "Client user not found" });
            return NoContent();
        }

        /// <summary>
        /// Grant project access to client
        /// </summary>
        [HttpPost("clients/{clientUserId}/access")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<ClientProjectAccessDto>> GrantProjectAccess(int clientUserId, [FromBody] GrantClientProjectAccessRequest request)
        {
            var companyId = GetCurrentCompanyId();
            request.ClientUserId = clientUserId;
            var access = await _clientPortalService.GrantProjectAccessAsync(companyId, request);
            return Ok(access);
        }

        #endregion

        #region Client Authentication (Client Portal)

        /// <summary>
        /// Client login
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<ClientLoginResponse>> ClientLogin([FromBody] ClientLoginRequest request)
        {
            var result = await _clientPortalService.ClientLoginAsync(request);
            if (result == null)
                return Unauthorized(new { message = "Invalid email or password" });
            return Ok(result);
        }

        /// <summary>
        /// Change client password
        /// </summary>
        [HttpPost("change-password")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> ChangeClientPassword([FromBody] ChangeClientPasswordRequest request)
        {
            var clientUserId = GetCurrentClientUserId();
            var result = await _clientPortalService.ChangeClientPasswordAsync(clientUserId, request);
            if (!result)
                return BadRequest(new { message = "Current password is incorrect" });
            return Ok(new { message = "Password changed successfully" });
        }

        /// <summary>
        /// Reset client password (send reset email)
        /// </summary>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetClientPassword([FromBody] ResetClientPasswordRequest request)
        {
            var result = await _clientPortalService.ResetClientPasswordAsync(request);
            // Always return success to prevent email enumeration
            return Ok(new { message = "If the email exists, a reset link has been sent" });
        }

        /// <summary>
        /// Set new password with reset token
        /// </summary>
        [HttpPost("set-password")]
        [AllowAnonymous]
        public async Task<IActionResult> SetClientPassword([FromBody] SetClientPasswordRequest request)
        {
            var result = await _clientPortalService.SetClientPasswordAsync(request);
            if (!result)
                return BadRequest(new { message = "Invalid or expired reset token" });
            return Ok(new { message = "Password set successfully" });
        }

        #endregion

        #region Client Dashboard

        /// <summary>
        /// Get client dashboard
        /// </summary>
        [HttpGet("dashboard")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<ClientDashboardDto>> GetClientDashboard()
        {
            var clientUserId = GetCurrentClientUserId();
            var dashboard = await _clientPortalService.GetClientDashboardAsync(clientUserId);
            return Ok(dashboard);
        }

        #endregion

        #region Client Payments

        /// <summary>
        /// Get client payment history
        /// </summary>
        [HttpGet("payments")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<List<ClientPaymentDto>>> GetClientPayments([FromQuery] int? projectId)
        {
            var clientUserId = GetCurrentClientUserId();
            var payments = await _clientPortalService.GetClientPaymentsAsync(clientUserId, projectId);
            return Ok(payments);
        }

        /// <summary>
        /// Get client payment summary
        /// </summary>
        [HttpGet("payments/summary")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<ClientPaymentSummaryDto>> GetClientPaymentSummary()
        {
            var clientUserId = GetCurrentClientUserId();
            var summary = await _clientPortalService.GetClientPaymentSummaryAsync(clientUserId);
            return Ok(summary);
        }

        #endregion

        #region Client Messages

        /// <summary>
        /// Get client messages
        /// </summary>
        [HttpGet("messages")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<List<ClientMessageDto>>> GetClientMessages([FromQuery] string? status)
        {
            var clientUserId = GetCurrentClientUserId();
            var messages = await _clientPortalService.GetClientMessagesAsync(clientUserId, status);
            return Ok(messages);
        }

        /// <summary>
        /// Get client message by ID
        /// </summary>
        [HttpGet("messages/{messageId}")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<ClientMessageDto>> GetClientMessage(int messageId)
        {
            var message = await _clientPortalService.GetClientMessageAsync(messageId);
            if (message == null)
                return NotFound(new { message = "Message not found" });
            return Ok(message);
        }

        /// <summary>
        /// Create new message
        /// </summary>
        [HttpPost("messages")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<ClientMessageDto>> CreateClientMessage([FromBody] CreateClientMessageRequest request)
        {
            var clientUserId = GetCurrentClientUserId();
            var message = await _clientPortalService.CreateClientMessageAsync(clientUserId, request);
            return CreatedAtAction(nameof(GetClientMessage), new { messageId = message.Id }, message);
        }

        /// <summary>
        /// Reply to message
        /// </summary>
        [HttpPost("messages/{messageId}/replies")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<MessageReplyDto>> ReplyToMessage(int messageId, [FromBody] CreateMessageReplyRequest request)
        {
            request.MessageId = messageId;
            var clientUserId = GetCurrentClientUserId();
            try
            {
                var reply = await _clientPortalService.ReplyToMessageAsync(clientUserId, request);
                return Ok(reply);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get message replies
        /// </summary>
        [HttpGet("messages/{messageId}/replies")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<List<MessageReplyDto>>> GetMessageReplies(int messageId)
        {
            var replies = await _clientPortalService.GetMessageRepliesAsync(messageId);
            return Ok(replies);
        }

        #endregion

        #region Change Orders

        /// <summary>
        /// Get client change order requests
        /// </summary>
        [HttpGet("change-orders")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<List<ChangeOrderRequestDto>>> GetChangeOrderRequests([FromQuery] int? projectId)
        {
            var clientUserId = GetCurrentClientUserId();
            var requests = await _clientPortalService.GetChangeOrderRequestsAsync(clientUserId, projectId);
            return Ok(requests);
        }

        /// <summary>
        /// Get change order request by ID
        /// </summary>
        [HttpGet("change-orders/{requestId}")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<ChangeOrderRequestDto>> GetChangeOrderRequest(int requestId)
        {
            var request = await _clientPortalService.GetChangeOrderRequestAsync(requestId);
            if (request == null)
                return NotFound(new { message = "Change order request not found" });
            return Ok(request);
        }

        /// <summary>
        /// Create change order request
        /// </summary>
        [HttpPost("change-orders")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<ChangeOrderRequestDto>> CreateChangeOrderRequest([FromBody] CreateChangeOrderRequestRequest request)
        {
            var clientUserId = GetCurrentClientUserId();
            try
            {
                var changeOrder = await _clientPortalService.CreateChangeOrderRequestAsync(clientUserId, request);
                return CreatedAtAction(nameof(GetChangeOrderRequest), new { requestId = changeOrder.Id }, changeOrder);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update change order request (draft only)
        /// </summary>
        [HttpPut("change-orders/{requestId}")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<ChangeOrderRequestDto>> UpdateChangeOrderRequest(int requestId, [FromBody] UpdateChangeOrderRequestRequest request)
        {
            request.Id = requestId;
            var changeOrder = await _clientPortalService.UpdateChangeOrderRequestAsync(requestId, request);
            if (changeOrder == null)
                return NotFound(new { message = "Change order request not found or cannot be updated" });
            return Ok(changeOrder);
        }

        /// <summary>
        /// Cancel change order request
        /// </summary>
        [HttpDelete("change-orders/{requestId}")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> CancelChangeOrderRequest(int requestId)
        {
            var cancelled = await _clientPortalService.CancelChangeOrderRequestAsync(requestId);
            if (!cancelled)
                return NotFound(new { message = "Change order request not found or cannot be cancelled" });
            return NoContent();
        }

        #endregion

        #region Client Project Progress

        /// <summary>
        /// Get client project progress
        /// </summary>
        [HttpGet("projects/{projectId}/progress")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<ClientProjectProgressDto>> GetClientProjectProgress(int projectId)
        {
            var clientUserId = GetCurrentClientUserId();
            var progress = await _clientPortalService.GetClientProjectProgressAsync(clientUserId, projectId);
            if (progress == null)
                return NotFound(new { message = "Project not found or access denied" });
            return Ok(progress);
        }

        #endregion

        #region Client Activities

        /// <summary>
        /// Get client recent activities
        /// </summary>
        [HttpGet("activities")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<List<ClientActivityDto>>> GetClientActivities([FromQuery] int count = 20)
        {
            var clientUserId = GetCurrentClientUserId();
            var activities = await _clientPortalService.GetClientActivitiesAsync(clientUserId, count);
            return Ok(activities);
        }

        #endregion

        #region Admin Message Management

        /// <summary>
        /// Get all client messages (admin)
        /// </summary>
        [HttpGet("admin/messages")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<ClientMessageDto>>> GetAllClientMessages(
            [FromQuery] string? status,
            [FromQuery] int? assignedTo)
        {
            var companyId = GetCurrentCompanyId();
            var messages = await _clientPortalService.GetAllClientMessagesAsync(companyId, status, assignedTo);
            return Ok(messages);
        }

        /// <summary>
        /// Assign message to staff (admin)
        /// </summary>
        [HttpPut("admin/messages/{messageId}/assign")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<ClientMessageDto>> AssignMessage(int messageId, [FromQuery] int assignedToUserId)
        {
            var message = await _clientPortalService.AssignMessageAsync(messageId, assignedToUserId);
            if (message == null)
                return NotFound(new { message = "Message not found" });
            return Ok(message);
        }

        /// <summary>
        /// Update message status (admin)
        /// </summary>
        [HttpPut("admin/messages/{messageId}/status")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<ClientMessageDto>> UpdateMessageStatus(int messageId, [FromQuery] string status)
        {
            var message = await _clientPortalService.UpdateMessageStatusAsync(messageId, status);
            if (message == null)
                return NotFound(new { message = "Message not found" });
            return Ok(message);
        }

        /// <summary>
        /// Resolve message (admin)
        /// </summary>
        [HttpPut("admin/messages/{messageId}/resolve")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<ClientMessageDto>> ResolveMessage(int messageId, [FromBody] string resolution)
        {
            var message = await _clientPortalService.ResolveMessageAsync(messageId, resolution);
            if (message == null)
                return NotFound(new { message = "Message not found" });
            return Ok(message);
        }

        #endregion

        #region Admin Change Order Management

        /// <summary>
        /// Get all change orders (admin)
        /// </summary>
        [HttpGet("admin/change-orders")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<ChangeOrderRequestDto>>> GetAllChangeOrders(
            [FromQuery] string? status,
            [FromQuery] int? projectId)
        {
            var companyId = GetCurrentCompanyId();
            var requests = await _clientPortalService.GetAllChangeOrdersAsync(companyId, status, projectId);
            return Ok(requests);
        }

        /// <summary>
        /// Review change order (admin)
        /// </summary>
        [HttpPut("admin/change-orders/{requestId}/review")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<ChangeOrderRequestDto>> ReviewChangeOrder(
            int requestId,
            [FromQuery] string status,
            [FromQuery] string? notes,
            [FromQuery] decimal? budget,
            [FromQuery] int? days)
        {
            var reviewedByUserId = GetCurrentUserId();
            var request = await _clientPortalService.ReviewChangeOrderAsync(requestId, reviewedByUserId, status, notes, budget, days);
            if (request == null)
                return NotFound(new { message = "Change order request not found" });
            return Ok(request);
        }

        #endregion

        #region Helper Methods

        private int GetCurrentCompanyId()
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (int.TryParse(companyIdClaim, out int companyId))
                return companyId;
            return 1;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (int.TryParse(userIdClaim, out int userId))
                return userId;
            return 0;
        }

        private int GetCurrentClientUserId()
        {
            var clientUserIdClaim = User.FindFirst("ClientUserId")?.Value;
            if (int.TryParse(clientUserIdClaim, out int clientUserId))
                return clientUserId;
            throw new UnauthorizedException("Client user ID not found in token");
        }

        #endregion
    }

    public class UnauthorizedException : Exception
    {
        public UnauthorizedException(string message) : base(message) { }
    }
}
