using ConstructionManagement.Application.DTOs.Messaging;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// Controller for company messaging system
/// </summary>
[ApiController]
[Route("api/messaging")]
[Authorize]
public class MessagingController : BaseApiController
{
    private readonly IMessagingService _messagingService;
    private readonly ICompanyContext _companyContext;
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<MessagingController> _logger;

    public MessagingController(
        IMessagingService messagingService,
        ICompanyContext companyContext,
        ICompanyFeatureService featureService,
        ApplicationDbContext dbContext,
        ILogger<MessagingController> logger) : base(featureService)
    {
        _messagingService = messagingService;
        _companyContext = companyContext;
        _dbContext = dbContext;
        _logger = logger;
    }

    // ── Conversation Endpoints ────────────────────────────────────────────────────

    /// <summary>
    /// Start a new conversation with a company
    /// </summary>
    [HttpPost("conversations")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ConversationDto>> StartConversation([FromForm] StartConversationRequest request, IFormFileCollection attachments)
    {
        // Messaging is a general feature available to all users (including unverified company owners)
        // Feature check removed as per requirement

        try
        {
            var userId = GetUserId();
            
            // Convert the request to the new format
            var serviceRequest = new StartConversationRequest
            {
                SenderCompanyId = request.SenderCompanyId,
                RecipientCompanyId = request.RecipientCompanyId,
                RecipientUserId = request.RecipientUserId,
                Message = request.Message
            };
            
            var attachmentList = attachments.ToList();
            var result = await _messagingService.StartConversationAsync(userId, serviceRequest, attachmentList);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting conversation");
            return StatusCode(500, new { message = "An error occurred while starting the conversation." });
        }
    }

    /// <summary>
    /// Get all conversations for the current user
    /// </summary>
    [HttpGet("conversations")]
    public async Task<ActionResult<IEnumerable<ConversationDto>>> GetConversations()
    {
        try
        {
            var userId = GetUserId();
            
            _logger.LogInformation("GetConversations called for userId: {UserId}", userId);
            
            // Get all conversations where user is initiator or target
            var conversations = await _messagingService.GetUserConversationsAsync(userId);
            _logger.LogInformation("Found {Count} conversations", conversations.Count());
            
            return Ok(conversations.OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting conversations");
            return StatusCode(500, new { message = "An error occurred while getting conversations." });
        }
    }

    /// <summary>
    /// Get a specific conversation with messages
    /// </summary>
    [HttpGet("conversations/{id}")]
    public async Task<ActionResult<ConversationDetailDto>> GetConversation(int id)
    {
        try
        {
            var userId = GetUserId();
            var result = await _messagingService.GetConversationAsync(id, userId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting conversation {ConversationId}", id);
            return StatusCode(500, new { message = "An error occurred while getting the conversation." });
        }
    }

    /// <summary>
    /// Send a message in a conversation
    /// </summary>
    [HttpPost("conversations/{id}/messages")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<CompanyMessageDto>> SendMessage(int id, [FromForm] SendMessageRequest request, IFormFileCollection attachments)
    {
        try
        {
            var userId = GetUserId();
            var attachmentList = attachments.ToList();
            var result = await _messagingService.SendMessageAsync(id, userId, request, attachmentList);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message in conversation {ConversationId}", id);
            return StatusCode(500, new { message = "An error occurred while sending the message." });
        }
    }

    /// <summary>
    /// Check if user can send a message in a conversation
    /// </summary>
    [HttpGet("conversations/{id}/can-send")]
    public async Task<ActionResult<CanSendMessageResult>> CanSendMessage(int id)
    {
        try
        {
            var userId = GetUserId();
            var result = await _messagingService.CanUserSendMessageAsync(id, userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user can send message");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    /// <summary>
    /// Get unread message count for current user
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        try
        {
            var userId = GetUserId();
            var count = await _messagingService.GetUnreadCountAsync(userId);
            return Ok(new { count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread count");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    // ── Approval/Blocking Endpoints ───────────────────────────────────────────────

    /// <summary>
    /// Approve a conversation (company owner only)
    /// </summary>
    [HttpPut("conversations/{id}/approve")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult> ApproveConversation(int id, [FromBody] ApproveConversationRequest? request = null)
    {
        try
        {
            var userId = GetUserId();
            await _messagingService.ApproveConversationAsync(id, userId, request?.Notes);
            return Ok(new { message = "Conversation approved successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving conversation {ConversationId}", id);
            return StatusCode(500, new { message = "An error occurred while approving the conversation." });
        }
    }

    /// <summary>
    /// Block a conversation (company owner only)
    /// </summary>
    [HttpPut("conversations/{id}/block")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult> BlockConversation(int id, [FromBody] BlockConversationRequest? request = null)
    {
        try
        {
            var userId = GetUserId();
            await _messagingService.BlockConversationAsync(id, userId, request?.Reason);
            return Ok(new { message = "Conversation blocked successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error blocking conversation {ConversationId}", id);
            return StatusCode(500, new { message = "An error occurred while blocking the conversation." });
        }
    }

    /// <summary>
    /// Unblock a conversation (company owner only)
    /// </summary>
    [HttpPut("conversations/{id}/unblock")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult> UnblockConversation(int id)
    {
        try
        {
            var userId = GetUserId();
            await _messagingService.UnblockConversationAsync(id, userId);
            return Ok(new { message = "Conversation unblocked successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unblocking conversation {ConversationId}", id);
            return StatusCode(500, new { message = "An error occurred while unblocking the conversation." });
        }
    }

    // ── User Blocking Endpoints ───────────────────────────────────────────────────

    /// <summary>
    /// Block a user from messaging the company (company owner only)
    /// </summary>
    [HttpPost("company/block-user")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult> BlockUser([FromBody] BlockUserRequest request)
    {
        try
        {
            var userId = GetUserId();
            var user = await GetUserAsync();
            
            if (user?.CompanyId == null)
            {
                return BadRequest(new { message = "You are not associated with a company." });
            }

            await _messagingService.BlockUserFromCompanyAsync(user.CompanyId.Value, request.UserId, userId, request.Reason);
            return Ok(new { message = "User blocked successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error blocking user");
            return StatusCode(500, new { message = "An error occurred while blocking the user." });
        }
    }

    /// <summary>
    /// Unblock a user from messaging the company (company owner only)
    /// </summary>
    [HttpDelete("company/block-user/{blockedUserId}")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult> UnblockUser(int blockedUserId)
    {
        try
        {
            var userId = GetUserId();
            var user = await GetUserAsync();
            
            if (user?.CompanyId == null)
            {
                return BadRequest(new { message = "You are not associated with a company." });
            }

            await _messagingService.UnblockUserFromCompanyAsync(user.CompanyId.Value, blockedUserId, userId);
            return Ok(new { message = "User unblocked successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unblocking user");
            return StatusCode(500, new { message = "An error occurred while unblocking the user." });
        }
    }

    /// <summary>
    /// Get all blocked users for the company (company owner only)
    /// </summary>
    [HttpGet("company/blocked-users")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult<IEnumerable<BlockedUserDto>>> GetBlockedUsers()
    {
        try
        {
            var user = await GetUserAsync();
            
            if (user?.CompanyId == null)
            {
                return BadRequest(new { message = "You are not associated with a company." });
            }

            var blockedUsers = await _messagingService.GetBlockedUsersAsync(user.CompanyId.Value);
            return Ok(blockedUsers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting blocked users");
            return StatusCode(500, new { message = "An error occurred while getting blocked users." });
        }
    }

    // ── Search Endpoints ───────────────────────────────────────────────────────────

    /// <summary>
    /// Search messages for the current user
    /// </summary>
    [HttpPost("search")]
    public async Task<ActionResult<IEnumerable<MessageSearchResultDto>>> SearchMessages([FromBody] MessageSearchRequest request)
    {
        try
        {
            var userId = GetUserId();
            var user = await GetUserAsync();
            
            // If user is company owner, search company messages
            if (user?.CompanyId.HasValue == true)
            {
                var companyResults = await _messagingService.SearchCompanyMessagesAsync(user.CompanyId.Value, request);
                return Ok(companyResults);
            }
            
            // Otherwise search user's own messages
            var results = await _messagingService.SearchUserMessagesAsync(userId, request);
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching messages");
            return StatusCode(500, new { message = "An error occurred while searching messages." });
        }
    }

    /// <summary>
    /// Search messages in a specific conversation
    /// </summary>
    [HttpGet("conversations/{id}/search")]
    public async Task<ActionResult<IEnumerable<MessageSearchResultDto>>> SearchConversationMessages(int id, [FromQuery] string searchTerm)
    {
        try
        {
            var userId = GetUserId();
            var results = await _messagingService.SearchConversationMessagesAsync(id, userId, searchTerm);
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching conversation messages");
            return StatusCode(500, new { message = "An error occurred while searching conversation messages." });
        }
    }

    // ── Messaging Status ───────────────────────────────────────────────────────────

    /// <summary>
    /// Get messaging restriction status for the current user
    /// </summary>
    [HttpGet("messaging-status")]
    public async Task<ActionResult<MessagingStatusDto>> GetMessagingStatus()
    {
        try
        {
            var userId = GetUserId();
            var result = await _messagingService.GetMessagingStatusAsync(userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting messaging status");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    // ── Company to User Messaging ─────────────────────────────────────────────────

    /// <summary>
    /// Start a new conversation from a company to a user (client/worker)
    /// Company owners can initiate conversations with clients and workers
    /// </summary>
    [HttpPost("conversations/with-user")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ConversationDto>> StartConversationWithUser([FromForm] StartConversationWithUserRequest request, IFormFileCollection attachments)
    {
        try
        {
            var userId = GetUserId();
            var attachmentList = attachments.ToList();
            
            // Use the unified StartConversationAsync which handles all cases
            var startRequest = new StartConversationRequest
            {
                RecipientUserId = request.TargetUserId,
                Message = request.Message
            };
            
            var result = await _messagingService.StartConversationAsync(userId, startRequest, attachmentList);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting conversation with user");
            return StatusCode(500, new { message = "An error occurred while starting the conversation." });
        }
    }

    /// <summary>
    /// Start a conversation with SystemAdmin (for unverified company owners)
    /// </summary>
    [HttpPost("conversations/system-admin")]
    public async Task<ActionResult<ConversationDto>> StartSystemAdminConversation([FromForm] StartSystemAdminConversationRequest request)
    {
        try
        {
            var userId = GetUserId();
            
            var result = await _messagingService.StartSystemAdminConversationAsync(userId, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting conversation with SystemAdmin");
            return StatusCode(500, new { message = "An error occurred while starting the conversation." });
        }
    }

    /// <summary>
    /// Get users that the company can message (clients and workers)
    /// </summary>
    [HttpGet("messagable-users")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult<IEnumerable<MessagableUserDto>>> GetMessagableUsers([FromQuery] string? userType = null)
    {
        try
        {
            var userId = GetUserId();
            var user = await GetUserAsync();
            
            // Check if SystemAdmin
            var isSystemAdmin = await _dbContext.UserRoles
                .Include(ur => ur.Role)
                .AnyAsync(ur => ur.UserId == userId && ur.Role.Name == "SystemAdmin");
            
            if (isSystemAdmin)
            {
                // SystemAdmin can message all company owners
                var result = await _messagingService.GetMessagableUsersForSystemAdminAsync(userId, userType);
                return Ok(result);
            }
            
            if (user?.CompanyId == null)
            {
                return BadRequest(new { message = "You are not associated with a company." });
            }

            var companyResult = await _messagingService.GetMessagableUsersAsync(user.CompanyId.Value, userType);
            return Ok(companyResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting messagable users");
            return StatusCode(500, new { message = "An error occurred while getting messagable users." });
        }
    }

    // ── Helper Methods ────────────────────────────────────────────────────────────



    private async Task<User?> GetUserAsync()
    {
        var userId = GetUserId();
        return await _dbContext.Users.FindAsync(userId);
    }

    /// <summary>
    /// Start a new conversation between two workers in the same company
    /// </summary>
    [HttpPost("conversations/worker")]
    [Authorize(Roles = "Worker,CompanyAdmin,Subcontractor,SiteManager,Engineer")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ConversationDto>> StartWorkerConversation([FromForm] StartWorkerConversationRequest request, IFormFileCollection attachments)
    {
        try
        {
            var userId = GetUserId();
            var attachmentList = attachments.ToList();
            var result = await _messagingService.StartWorkerConversationAsync(userId, request, attachmentList);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting worker conversation");
            return StatusCode(500, new { message = "An error occurred while starting the conversation." });
        }
    }
}
