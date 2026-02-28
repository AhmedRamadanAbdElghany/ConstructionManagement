using ConstructionManagement.Application.DTOs.Messaging;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
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
    public async Task<ActionResult<ConversationDto>> StartConversation([FromForm] StartConversationRequest request)
    {
        // Messaging is a general feature available to all users (including unverified company owners)
        // Feature check removed as per requirement

        try
        {
            var userId = GetUserId();
            var attachments = Request.Form.Files.ToList();
            var result = await _messagingService.StartConversationAsync(userId, request, attachments);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
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
            var user = await GetUserAsync();
            
            _logger.LogInformation("GetConversations called for userId: {UserId}, user.CompanyId: {CompanyId}, UserType: {UserType}", 
                userId, user?.CompanyId, user?.UserType);
            
            // 1. Every user can have user-level conversations (as initiator or target)
            var userConversations = await _messagingService.GetUserConversationsAsync(userId);
            _logger.LogInformation("Found {Count} user conversations", userConversations.Count());
            
            var allConversations = new Dictionary<int, ConversationDto>();
            foreach (var c in userConversations)
            {
                allConversations[c.Id] = c;
            }

            // 2. Determine if user is allowed to see company-level conversations
            var isSuperAdmin = await _dbContext.UserRoles
                .Include(ur => ur.Role)
                .AnyAsync(ur => ur.UserId == userId && ur.Role.Name == "SuperAdmin");
                
            var isCompanyOwner = user?.UserType == ConstructionManagement.Domain.Enums.UserType.CompanyOwner;
            _logger.LogInformation("User {UserId} isSuperAdmin: {IsSuperAdmin}, isCompanyOwner: {IsCompanyOwner}", 
                userId, isSuperAdmin, isCompanyOwner);

            if (isSuperAdmin || isCompanyOwner)
            {
                int? companyIdToFetch = null;

                if (isCompanyOwner && user?.CompanyId.HasValue == true)
                {
                    companyIdToFetch = user.CompanyId.Value;
                }
                else if (isSuperAdmin)
                {
                    // Find SuperAdmin's designated company
                    companyIdToFetch = await _dbContext.Users
                        .Where(u => u.UserRoles.Any(ur => ur.Role.Name == "SuperAdmin") && u.CompanyId.HasValue)
                        .Select(u => u.CompanyId)
                        .FirstOrDefaultAsync();
                        
                    if (!companyIdToFetch.HasValue || companyIdToFetch.Value == 0)
                    {
                        var systemAdminCompany = await _dbContext.Companies
                            .FirstOrDefaultAsync(c => c.BusinessId == "SYSTEM-ADMIN");
                        companyIdToFetch = systemAdminCompany?.Id;
                    }
                }

                if (companyIdToFetch.HasValue && companyIdToFetch.Value > 0)
                {
                    _logger.LogInformation("Getting company conversations for CompanyId: {CompanyId}", companyIdToFetch.Value);
                    var companyConversations = await _messagingService.GetCompanyConversationsAsync(companyIdToFetch.Value, userId);
                    _logger.LogInformation("Found {Count} company conversations", companyConversations.Count());
                    
                    foreach (var c in companyConversations)
                    {
                        // Deduplicate (company conversation representation takes precedence for owner/admin)
                        allConversations[c.Id] = c;
                    }
                }
            }

            _logger.LogInformation("Returning {Count} total conversations", allConversations.Count);
            return Ok(allConversations.Values.OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt));
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
    public async Task<ActionResult<CompanyMessageDto>> SendMessage(int id, [FromForm] SendMessageRequest request)
    {
        try
        {
            var userId = GetUserId();
            var attachments = Request.Form.Files.ToList();
            var result = await _messagingService.SendMessageAsync(id, userId, request, attachments);
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
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
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
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
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
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
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
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
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
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
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
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
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
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
    public async Task<ActionResult<ConversationDto>> StartConversationWithUser([FromForm] StartConversationWithUserRequest request)
    {
        try
        {
            var userId = GetUserId();
            var attachments = Request.Form.Files.ToList();
            
            // Check if SuperAdmin
            var isSuperAdmin = await _dbContext.UserRoles
                .Include(ur => ur.Role)
                .AnyAsync(ur => ur.UserId == userId && ur.Role.Name == "SuperAdmin");
            
            if (isSuperAdmin)
            {
                // SuperAdmin messaging a user: create conversation targeting the user's company
                var targetUser = await _dbContext.Users.FindAsync(request.TargetUserId);
                if (targetUser == null)
                {
                    return BadRequest(new { message = "Target user not found." });
                }
                
                if (!targetUser.CompanyId.HasValue)
                {
                    return BadRequest(new { message = "Target user is not associated with a company." });
                }
                
                // Use StartConversation targeting the user's company
                var startRequest = new StartConversationRequest
                {
                    CompanyId = targetUser.CompanyId.Value,
                    Message = request.Message
                };
                var result = await _messagingService.StartConversationAsync(userId, startRequest, attachments);
                return Ok(result);
            }
            
            var normalResult = await _messagingService.StartConversationWithUserAsync(userId, request, attachments);
            return Ok(normalResult);
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
    /// Get users that the company can message (clients and workers)
    /// </summary>
    [HttpGet("messagable-users")]
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
    public async Task<ActionResult<IEnumerable<MessagableUserDto>>> GetMessagableUsers([FromQuery] string? userType = null)
    {
        try
        {
            var userId = GetUserId();
            var user = await GetUserAsync();
            
            // Check if SuperAdmin
            var isSuperAdmin = await _dbContext.UserRoles
                .Include(ur => ur.Role)
                .AnyAsync(ur => ur.UserId == userId && ur.Role.Name == "SuperAdmin");
            
            if (isSuperAdmin)
            {
                // SuperAdmin can message all company owners
                var result = await _messagingService.GetMessagableUsersForSuperAdminAsync(userId, userType);
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
    public async Task<ActionResult<ConversationDto>> StartWorkerConversation([FromForm] StartWorkerConversationRequest request)
    {
        try
        {
            var userId = GetUserId();
            var attachments = Request.Form.Files.ToList();
            var result = await _messagingService.StartWorkerConversationAsync(userId, request, attachments);
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
