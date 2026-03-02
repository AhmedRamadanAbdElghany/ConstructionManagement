using ConstructionManagement.Application.DTOs.Messaging;
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service for managing company messaging system
/// </summary>
public interface IMessagingService
{
    // ── Conversation Management ──────────────────────────────────────────────────
    
    /// <summary>
    /// Start a new conversation with a company (sends initial message)
    /// </summary>
    /// <param name="userId">The user starting the conversation</param>
    /// <param name="request">The conversation request with company ID and message</param>
    /// <param name="attachments">Optional file attachments</param>
    /// <returns>The created conversation</returns>
    Task<ConversationDto> StartConversationAsync(int userId, StartConversationRequest request, List<IFormFile>? attachments = null);
    
    /// <summary>
    /// Get all conversations for a user (as initiator)
    /// </summary>
    Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(int userId);
    
    /// <summary>
    /// Get all conversations for a company (as company owner/admin)
    /// </summary>
    Task<IEnumerable<ConversationDto>> GetCompanyConversationsAsync(int companyId, int requestingUserId);
    
    /// <summary>
    /// Get a specific conversation with all messages
    /// </summary>
    Task<ConversationDetailDto> GetConversationAsync(int conversationId, int userId);
    
    // ── Messaging ────────────────────────────────────────────────────────────────
    
    /// <summary>
    /// Send a message in an existing conversation
    /// </summary>
    /// <param name="conversationId">The conversation to send to</param>
    /// <param name="senderId">The sender's user ID</param>
    /// <param name="request">The message content</param>
    /// <param name="attachments">Optional file attachments</param>
    /// <returns>The created message</returns>
    Task<CompanyMessageDto> SendMessageAsync(int conversationId, int senderId, SendMessageRequest request, List<IFormFile>? attachments = null);
    
    /// <summary>
    /// Check if a user can send a message in a conversation
    /// </summary>
    Task<CanSendMessageResult> CanUserSendMessageAsync(int conversationId, int userId);
    
    /// <summary>
    /// Mark all messages in a conversation as read for a user
    /// </summary>
    Task MarkMessagesAsReadAsync(int conversationId, int userId);
    
    /// <summary>
    /// Get unread message count for a user
    /// </summary>
    Task<int> GetUnreadCountAsync(int userId);
    
    // ── Approval/Blocking ────────────────────────────────────────────────────────
    
    /// <summary>
    /// Approve a conversation (company owner only)
    /// </summary>
    Task ApproveConversationAsync(int conversationId, int approverId, string? notes = null);
    
    /// <summary>
    /// Block a conversation (company owner only)
    /// </summary>
    Task BlockConversationAsync(int conversationId, int blockerId, string? reason = null);
    
    /// <summary>
    /// Unblock a conversation (company owner only)
    /// </summary>
    Task UnblockConversationAsync(int conversationId, int unblockerId);
    
    // ── User Blocking ─────────────────────────────────────────────────────────────
    
    /// <summary>
    /// Block a user from messaging a company (company owner only)
    /// </summary>
    Task BlockUserFromCompanyAsync(int companyId, int userId, int blockedBy, string? reason = null);
    
    /// <summary>
    /// Unblock a user from messaging a company (company owner only)
    /// </summary>
    Task UnblockUserFromCompanyAsync(int companyId, int userId, int unblockedBy);
    
    /// <summary>
    /// Get all blocked users for a company
    /// </summary>
    Task<IEnumerable<BlockedUserDto>> GetBlockedUsersAsync(int companyId);
    
    /// <summary>
    /// Check if a user is blocked from messaging a company
    /// </summary>
    Task<bool> IsUserBlockedAsync(int companyId, int userId);
    
    // ── Search ─────────────────────────────────────────────────────────────────────
    
    /// <summary>
    /// Search messages for a user (in their conversations)
    /// </summary>
    Task<IEnumerable<MessageSearchResultDto>> SearchUserMessagesAsync(int userId, MessageSearchRequest request);
    
    /// <summary>
    /// Search messages for a company (in company conversations)
    /// </summary>
    Task<IEnumerable<MessageSearchResultDto>> SearchCompanyMessagesAsync(int companyId, MessageSearchRequest request);
    
    /// <summary>
    /// Search messages in a specific conversation
    /// </summary>
    Task<IEnumerable<MessageSearchResultDto>> SearchConversationMessagesAsync(int conversationId, int userId, string searchTerm);
    
    // ── Unverified Owner Restrictions ─────────────────────────────────────────────
    
    /// <summary>
    /// Get messaging restriction status for a user
    /// </summary>
    /// <param name="userId">The user to check</param>
    /// <returns>Information about messaging restrictions</returns>
    Task<MessagingStatusDto> GetMessagingStatusAsync(int userId);
    
    // ── Company to User Messaging ─────────────────────────────────────────────────
    
    /// <summary>
    /// Start a new conversation from a company to a user (client/worker)
    /// Company owners can initiate conversations with clients and workers
    /// </summary>
    /// <param name="companyOwnerId">The company owner initiating the conversation</param>
    /// <param name="request">The conversation request with target user ID and message</param>
    /// <param name="attachments">Optional file attachments</param>
    /// <returns>The created conversation</returns>
    Task<ConversationDto> StartConversationWithUserAsync(int companyOwnerId, StartConversationWithUserRequest request, List<IFormFile>? attachments = null);
    
    /// <summary>
    /// Get users that a company can message (clients and workers)
    /// </summary>
    /// <param name="companyId">The company to get users for</param>
    /// <param name="userType">Optional filter by user type (NormalUser, Worker)</param>
    /// <returns>List of users that can be messaged</returns>
    Task<IEnumerable<MessagableUserDto>> GetMessagableUsersAsync(int companyId, string? userType = null);

    /// <summary>
    /// Get users that SystemAdmin can message (all company owners across all companies)
    /// </summary>
    /// <param name="systemAdminUserId">The SystemAdmin's user ID</param>
    /// <param name="userType">Optional filter by user type</param>
    /// <returns>List of company owners that can be messaged</returns>
    Task<IEnumerable<MessagableUserDto>> GetMessagableUsersForSystemAdminAsync(int systemAdminUserId, string? userType = null);

    /// <summary>
    /// Start a new conversation between two workers in the same company
    /// </summary>
    Task<ConversationDto> StartWorkerConversationAsync(int initiatorId, StartWorkerConversationRequest request, List<IFormFile>? attachments = null);
}
