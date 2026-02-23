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
    /// Get all conversations for a company (as company owner)
    /// </summary>
    Task<IEnumerable<ConversationDto>> GetCompanyConversationsAsync(int companyId);
    
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
}
