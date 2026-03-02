using ConstructionManagement.Application.DTOs.Messaging;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for managing company messaging system
/// </summary>
public class MessagingService : IMessagingService
{
    private readonly ApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<MessagingService> _logger;

    // Static cache for SystemAdmin company IDs to avoid N+1 queries
    private static readonly ConcurrentDictionary<string, (DateTime Timestamp, HashSet<int> CompanyIds)> _systemAdminCompanyCache = new();
    private static readonly TimeSpan SystemAdminCacheDuration = TimeSpan.FromMinutes(5);

    public MessagingService(
        ApplicationDbContext context,
        IFileStorageService fileStorage,
        ILogger<MessagingService> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    /// <summary>
    /// Get cached SystemAdmin company IDs
    /// </summary>
    private async Task<HashSet<int>> GetSystemAdminCompanyIdsAsync()
    {
        var cacheKey = "SystemAdminCompanyIds";
        
        if (_systemAdminCompanyCache.TryGetValue(cacheKey, out var cached) && 
            DateTime.UtcNow - cached.Timestamp < SystemAdminCacheDuration)
        {
            return cached.CompanyIds;
        }

        // Query database for companies with SystemAdmin users
        var companyIds = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .Where(u => u.UserRoles.Any(ur => ur.Role.Name == "SystemAdmin"))
            .Select(u => u.CompanyId)
            .Distinct()
            .ToListAsync();

        var result = new HashSet<int>(companyIds.Where(id => id.HasValue).Select(id => id!.Value));
        
        _systemAdminCompanyCache[cacheKey] = (DateTime.UtcNow, result);
        
        return result;
    }

    // ── Conversation Management ──────────────────────────────────────────────────

    public async Task<ConversationDto> StartConversationAsync(int userId, StartConversationRequest request, List<IFormFile>? attachments = null)
    {
        // Validate
        if (request.RecipientUserId <= 0)
        {
            throw new ArgumentException("RecipientUserId is required.");
        }
        
        // Get sender and recipient info
        var sender = await _context.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Id == userId);
        var recipient = await _context.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Id == request.RecipientUserId);
            
        if (sender == null || recipient == null)
        {
            throw new ArgumentException("Sender or Recipient not found.");
        }
        
        // Check for existing conversation (Any direction)
        var existingConversation = await _context.Conversations
            .FirstOrDefaultAsync(c => 
                (c.InitiatorUserId == userId && c.TargetUserId == request.RecipientUserId) ||
                (c.InitiatorUserId == request.RecipientUserId && c.TargetUserId == userId));
        
        if (existingConversation != null)
        {
            // If exists, use SendMessage instead
            var messageDto = await SendMessageAsync(existingConversation.Id, userId, new SendMessageRequest { Content = request.Message }, attachments);
            return await MapToConversationDto(existingConversation, userId);
        }
        
        // Determine if this should be auto-approved based on the new rules
        var shouldAutoApprove = await ShouldAutoApproveNewConversationAsync(sender, recipient);
        
        // Create the conversation
        var conversation = new Conversation
        {
            TargetUserId = request.RecipientUserId,
            InitiatorUserId = userId,
            Status = shouldAutoApprove ? "Approved" : "Pending",
            CreatedAt = DateTime.UtcNow,
            CompanyId = recipient.CompanyId // Keep for context
        };

        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync();

        // Create initial message
        var message = new Message
        {
            ConversationId = conversation.Id,
            SenderUserId = userId,
            Content = request.Message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            CompanyId = recipient.CompanyId // Keep for context
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        // Handle attachments
        if (attachments != null && attachments.Count > 0)
        {
            foreach (var file in attachments)
            {
                var attachment = await SaveAttachmentAsync(file, message, recipient.CompanyId);
                _context.MessageFileAttachments.Add(attachment);
            }
            await _context.SaveChangesAsync();
        }

        // Update conversation with last message info
        conversation.LastMessageId = message.Id;
        conversation.LastMessageAt = message.CreatedAt;
        await _context.SaveChangesAsync();

        return await MapToConversationDto(conversation, userId);
    }

    private async Task<bool> ShouldAutoApproveNewConversationAsync(User sender, User recipient)
    {
        // Rule: Every user can send message to himself
        if (sender.Id == recipient.Id) return true;

        // Rule: User sends message to their own company
        if (sender.CompanyId.HasValue && sender.CompanyId == recipient.CompanyId) return true;

        // Rule: Company owner selects a user (client/worker) from their company
        // Check if sender is owner and recipient is in same company
        if ((sender.UserType == UserType.CompanyOwner || sender.UserType == UserType.InventoryOwner) && 
            sender.CompanyId.HasValue && sender.CompanyId == recipient.CompanyId) return true;

        // Rule: Unverified Owner -> SystemAdmin
        var isSystemAdmin = recipient.UserRoles.Any(ur => ur.Role.Name == "SystemAdmin") || recipient.UserType == UserType.SystemAdmin;
        if (sender.UserType == UserType.CompanyOwner && isSystemAdmin) return true;

        // Rule: Worker to SystemAdmin
        if (sender.UserType == UserType.Worker && isSystemAdmin) return true;

        // Rule: Worker to other worker in same company
        if (sender.UserType == UserType.Worker && recipient.UserType == UserType.Worker && 
            sender.CompanyId.HasValue && sender.CompanyId == recipient.CompanyId) return true;

        // Default: User to Company (different company) or other cases -> Pending
        return false;
    }


    /// <summary>
    /// Check if user is blocked by another user
    /// </summary>
    private async Task<bool> IsUserBlockedByUserAsync(int blockerUserId, int blockedUserId)
    {
        // Check if there's a block relationship (implement if you have such a table)
        // For now, return false (not implemented)
        return false;
    }

    /// <summary>
    /// Get conversations for a user
    /// </summary>
    public async Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(int userId)
    {
        // Get conversations where user is the initiator (User → Company)
        // OR where user is the target (Company → User)
        var conversations = await _context.Conversations
            .Include(c => c.Company)
            .Include(c => c.InitiatorUser)
            .Include(c => c.TargetUser)
            .Include(c => c.LastMessage)
            .Where(c => c.InitiatorUserId == userId || c.TargetUserId == userId)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();

        var result = new List<ConversationDto>();
        foreach (var conv in conversations)
        {
            result.Add(await MapToConversationDto(conv, userId));
        }

        return result;
    }

    public async Task<IEnumerable<ConversationDto>> GetConversationsAsync(int companyId, int requestingUserId)
    {
        var conversations = await _context.Conversations
            .Include(c => c.Company)
            .Include(c => c.InitiatorUser)
            .Include(c => c.LastMessage)
            .Where(c => c.CompanyId == companyId)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();

        var result = new List<ConversationDto>();
        foreach (var conv in conversations)
        {
            result.Add(await MapToConversationDto(conv, requestingUserId, isCompanyOwner: true));
        }

        return result;
    }

    /// <summary>
    /// Get all conversations for a company (as company owner/admin)
    /// Alias for GetConversationsAsync to match interface
    /// </summary>
    public async Task<IEnumerable<ConversationDto>> GetCompanyConversationsAsync(int companyId, int requestingUserId)
    {
        return await GetConversationsAsync(companyId, requestingUserId);
    }

    public async Task<ConversationDetailDto> GetConversationAsync(int conversationId, int userId)
    {
        var conversation = await _context.Conversations
            .Include(c => c.Company)
            .Include(c => c.InitiatorUser)
            .Include(c => c.Messages)
                .ThenInclude(m => m.Attachments)
            .Include(c => c.Messages)
                .ThenInclude(m => m.SenderUser)
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found.");
        }

        // Check access - user must be either initiator, company owner, or SystemAdmin
        var isInitiator = conversation.InitiatorUserId == userId;
        var user = await _context.Users.FindAsync(userId);
        var isCompanyOwner = user != null && user.CompanyId == conversation.CompanyId;
        
        // Check if user is SystemAdmin - SystemAdmin can access ANY conversation
        var isSystemAdmin = await _context.UserRoles
            .Include(ur => ur.Role)
            .AnyAsync(ur => ur.UserId == userId && ur.Role.Name == "SystemAdmin");

        if (!isInitiator && !isCompanyOwner && !isSystemAdmin)
        {
            throw new UnauthorizedAccessException("You do not have access to this conversation.");
        }

        // Auto-approve conversation if SystemAdmin opens it for the first time and it's pending
        // This handles conversations created before auto-approval was implemented
        if (isSystemAdmin && conversation.Status == "Pending")
        {
            // Check if this conversation is with SystemAdmin's company
            var isSystemAdminCompany = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AnyAsync(u => u.CompanyId == conversation.CompanyId &&
                               u.UserRoles.Any(ur => ur.Role.Name == "SystemAdmin"));
            
            if (!isSystemAdminCompany)
            {
                isSystemAdminCompany = await _context.Companies
                    .AnyAsync(c => c.Id == conversation.CompanyId && c.BusinessId == "SYSTEM-ADMIN");
            }

            if (isSystemAdminCompany)
            {
                // Auto-approve the conversation
                conversation.Status = "Approved";
                conversation.ApprovedAt = DateTime.UtcNow;
                conversation.ApprovedByUserId = userId;
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Conversation {ConversationId} auto-approved by SystemAdmin {UserId}", 
                    conversationId, userId);
            }
        }

        // Mark messages as read
        await MarkMessagesAsReadAsync(conversationId, userId);

        return await MapToConversationDetailDto(conversation, userId, isCompanyOwner || isSystemAdmin);
    }

    // ── Messaging ────────────────────────────────────────────────────────────────

    public async Task<CompanyMessageDto> SendMessageAsync(int conversationId, int senderId, SendMessageRequest request, List<IFormFile>? attachments = null)
    {
        var conversation = await _context.Conversations
            .Include(c => c.Company)
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found.");
        }

        // Check if user can message this company (restriction for unverified owners)
        if (!await CanMessageRecipientAsync(senderId, conversation.CompanyId ?? 0))
        {
            throw new InvalidOperationException(
                "Your company is pending approval. You can only message SystemAdmin until your company is approved.");
        }

        // Check if user can send message
        var canSend = await CanUserSendMessageAsync(conversationId, senderId);
        if (!canSend.CanSend)
        {
            throw new InvalidOperationException(canSend.Reason ?? "Cannot send message.");
        }

        // Determine if sender is company owner
        var sender = await _context.Users.FindAsync(senderId);
        var isFromCompany = sender != null && sender.CompanyId == conversation.CompanyId;

        var message = new Message
        {
            CompanyId = conversation.CompanyId,
            ConversationId = conversationId,
            SenderUserId = senderId,
            Content = request.Content,
            IsFromCompany = isFromCompany,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        // Handle attachments
        if (attachments != null && attachments.Count > 0)
        {
            foreach (var file in attachments)
            {
                var attachment = await SaveAttachmentAsync(file, message, conversation.CompanyId);
                _context.MessageFileAttachments.Add(attachment);
            }
            await _context.SaveChangesAsync();
        }

        // Update conversation with last message info
        conversation.LastMessageId = message.Id;
        conversation.LastMessageAt = message.CreatedAt;
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} sent message {MessageId} in conversation {ConversationId}", 
            senderId, message.Id, conversationId);

        return MapToCompanyMessageDto(message);
    }

    public async Task<CanSendMessageResult> CanUserSendMessageAsync(int conversationId, int userId)
    {
        var conversation = await _context.Conversations
            .Include(c => c.InitiatorUser)
            .Include(c => c.TargetUser)
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conversation == null)
        {
            return new CanSendMessageResult { CanSend = false, Reason = "Conversation not found." };
        }

        // Participant check
        if (conversation.InitiatorUserId != userId && conversation.TargetUserId != userId)
        {
            return new CanSendMessageResult { CanSend = false, Reason = "You are not a participant." };
        }

        // Self messaging always allowed
        if (conversation.InitiatorUserId == conversation.TargetUserId && conversation.InitiatorUserId == userId)
        {
            return new CanSendMessageResult { CanSend = true, Status = "Approved" };
        }

        if (conversation.Status == "Blocked")
        {
            return new CanSendMessageResult { CanSend = false, Reason = "Conversation blocked.", Status = "Blocked" };
        }

        if (conversation.Status == "Approved")
        {
            return new CanSendMessageResult { CanSend = true, Status = "Approved" };
        }

        // Pending state: check if user is the initiator and how many messages sent
        if (conversation.Status == "Pending")
        {
            // If sender is the one being messaged (e.g. Company Owner), they can reply (which should probably approve it or they can explicitly approve)
            // But per rules, initiator can only send 1.
            if (userId == conversation.InitiatorUserId)
            {
                var messageCount = await _context.Messages
                    .CountAsync(m => m.ConversationId == conversationId && m.SenderUserId == userId);

                if (messageCount == 0)
                {
                    return new CanSendMessageResult { CanSend = true, Status = "Pending" };
                }

                return new CanSendMessageResult 
                { 
                    CanSend = false, 
                    Reason = "Wait for approval to send more messages.",
                    Status = "Pending"
                };
            }
            else
            {
                // Recipient can reply once even if pending? 
                // Rules say: "User cannot send more messages until approved".
                // Usually replying implies approval or just a one-off.
                // Let's allow recipient to send messages (which usually works as an approval if they want).
                return new CanSendMessageResult { CanSend = true, Status = "Pending" };
            }
        }

        return new CanSendMessageResult { CanSend = false, Reason = "Invalid conversation state." };
    }

    public async Task MarkMessagesAsReadAsync(int conversationId, int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return;

        var conversation = await _context.Conversations.FindAsync(conversationId);
        if (conversation == null) return;

        var messagesToUpdate = await _context.Messages
            .Where(m => m.ConversationId == conversationId && !m.IsRead && m.SenderUserId != userId)
            .ToListAsync();

        foreach (var message in messagesToUpdate)
        {
            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return 0;

        return await _context.Messages
            .Include(m => m.Conversation)
            .Where(m => !m.IsRead && m.SenderUserId != userId)
            .Where(m => m.Conversation != null && 
                        (m.Conversation.InitiatorUserId == userId || 
                         m.Conversation.TargetUserId == userId))
            .CountAsync();
    }

    // ── Approval/Blocking ────────────────────────────────────────────────────────

    public async Task ApproveConversationAsync(int conversationId, int approverId, string? notes = null)
    {
        var conversation = await _context.Conversations.FindAsync(conversationId);
        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found.");
        }

        // Only the target of the original request can approve
        if (conversation.TargetUserId != approverId)
        {
            throw new UnauthorizedAccessException("Only the recipient can approve this conversation.");
        }

        conversation.Status = "Approved";
        conversation.ApprovedAt = DateTime.UtcNow;
        conversation.ApprovedByUserId = approverId;

        await _context.SaveChangesAsync();
    }

    public async Task BlockConversationAsync(int conversationId, int blockerId, string? reason = null)
    {
        var conversation = await _context.Conversations.FindAsync(conversationId);
        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found.");
        }

        // Verify blocker is company owner
        var blocker = await _context.Users.FindAsync(blockerId);
        if (blocker == null || blocker.CompanyId != conversation.CompanyId)
        {
            throw new UnauthorizedAccessException("Only company owners can block conversations.");
        }

        conversation.Status = "Blocked";
        conversation.BlockedAt = DateTime.UtcNow;
        conversation.BlockReason = reason;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Conversation {ConversationId} blocked by user {BlockerId}. Reason: {Reason}", 
            conversationId, blockerId, reason);
    }

    public async Task UnblockConversationAsync(int conversationId, int unblockerId)
    {
        var conversation = await _context.Conversations.FindAsync(conversationId);
        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found.");
        }

        // Verify unblocker is company owner
        var unblocker = await _context.Users.FindAsync(unblockerId);
        if (unblocker == null || unblocker.CompanyId != conversation.CompanyId)
        {
            throw new UnauthorizedAccessException("Only company owners can unblock conversations.");
        }

        // Set status back to Approved if it was blocked
        if (conversation.Status == "Blocked")
        {
            conversation.Status = conversation.ApprovedAt.HasValue ? "Approved" : "Pending";
            conversation.BlockedAt = null;
            conversation.BlockReason = null;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Conversation {ConversationId} unblocked by user {UnblockerId}", 
            conversationId, unblockerId);
    }

    // ── User Blocking ─────────────────────────────────────────────────────────────

    public async Task BlockUserFromCompanyAsync(int companyId, int userId, int blockedBy, string? reason = null)
    {
        // Verify blocker is company owner
        var blocker = await _context.Users.FindAsync(blockedBy);
        if (blocker == null || blocker.CompanyId != companyId)
        {
            throw new UnauthorizedAccessException("Only company owners can block users.");
        }

        // Check if already blocked
        var existingBlock = await _context.UserMessagingBlocks
            .FirstOrDefaultAsync(b => b.CompanyId == companyId && b.UserId == userId && b.IsActive);

        if (existingBlock != null)
        {
            throw new InvalidOperationException("User is already blocked.");
        }

        var block = new UserMessagingBlock
        {
            CompanyId = companyId,
            UserId = userId,
            BlockedByUserId = blockedBy,
            Reason = reason,
            BlockedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.UserMessagingBlocks.Add(block);

        // Also block all existing conversations with this user
        var conversations = await _context.Conversations
            .Where(c => c.CompanyId == companyId && c.InitiatorUserId == userId && c.Status != "Blocked")
            .ToListAsync();

        foreach (var conv in conversations)
        {
            conv.Status = "Blocked";
            conv.BlockedAt = DateTime.UtcNow;
            conv.BlockReason = reason ?? "User blocked from company";
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} blocked from company {CompanyId} by user {BlockedBy}. Reason: {Reason}", 
            userId, companyId, blockedBy, reason);
    }

    public async Task UnblockUserFromCompanyAsync(int companyId, int userId, int unblockedBy)
    {
        // Verify unblocker is company owner
        var unblocker = await _context.Users.FindAsync(unblockedBy);
        if (unblocker == null || unblocker.CompanyId != companyId)
        {
            throw new UnauthorizedAccessException("Only company owners can unblock users.");
        }

        var block = await _context.UserMessagingBlocks
            .FirstOrDefaultAsync(b => b.CompanyId == companyId && b.UserId == userId && b.IsActive);

        if (block == null)
        {
            throw new InvalidOperationException("User is not blocked.");
        }

        block.IsActive = false;
        block.UnblockedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} unblocked from company {CompanyId} by user {UnblockedBy}", 
            userId, companyId, unblockedBy);
    }

    public async Task<IEnumerable<BlockedUserDto>> GetBlockedUsersAsync(int companyId)
    {
        var blocks = await _context.UserMessagingBlocks
            .Include(b => b.User)
            .Include(b => b.BlockedByUser)
            .Where(b => b.CompanyId == companyId && b.IsActive)
            .OrderByDescending(b => b.BlockedAt)
            .ToListAsync();

        return blocks.Select(b => new BlockedUserDto
        {
            Id = b.Id,
            UserId = b.UserId,
            UserName = b.User?.FullName ?? b.User?.Email ?? "Unknown",
            UserEmail = b.User?.Email,
            Reason = b.Reason,
            BlockedAt = b.BlockedAt,
            BlockedByName = b.BlockedByUser?.FullName ?? b.BlockedByUser?.Email ?? "Unknown",
            IsActive = b.IsActive
        });
    }

    public async Task<bool> IsUserBlockedAsync(int companyId, int userId)
    {
        return await _context.UserMessagingBlocks
            .AnyAsync(b => b.CompanyId == companyId && b.UserId == userId && b.IsActive);
    }

    // ── Search ─────────────────────────────────────────────────────────────────────

    public async Task<IEnumerable<MessageSearchResultDto>> SearchUserMessagesAsync(int userId, MessageSearchRequest request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return Enumerable.Empty<MessageSearchResultDto>();

        var query = _context.Messages
            .Include(m => m.Conversation)
            .Include(m => m.SenderUser)
            .Include(m => m.Attachments)
            .Where(m => m.Conversation.InitiatorUserId == userId);

        return await ExecuteSearchAsync(query, request);
    }

    public async Task<IEnumerable<MessageSearchResultDto>> SearchMessagesAsync(int companyId, MessageSearchRequest request)
    {
        var query = _context.Messages
            .Include(m => m.Conversation)
            .Include(m => m.SenderUser)
            .Include(m => m.Attachments)
            .Where(m => m.Conversation.CompanyId == companyId);

        return await ExecuteSearchAsync(query, request);
    }

    public async Task<IEnumerable<MessageSearchResultDto>> SearchConversationMessagesAsync(int conversationId, int userId, string searchTerm)
    {
        var user = await _context.Users.FindAsync(userId);
        var conversation = await _context.Conversations.FindAsync(conversationId);

        if (user == null || conversation == null)
            return Enumerable.Empty<MessageSearchResultDto>();

        // Verify user has access to this conversation
        var isInitiator = conversation.InitiatorUserId == userId;
        var isCompanyOwner = user.CompanyId == conversation.CompanyId;

        if (!isInitiator && !isCompanyOwner)
            return Enumerable.Empty<MessageSearchResultDto>();

        var request = new MessageSearchRequest
        {
            SearchTerm = searchTerm,
            ConversationId = conversationId
        };

        var query = _context.Messages
            .Include(m => m.Conversation)
            .Include(m => m.SenderUser)
            .Include(m => m.Attachments)
            .Where(m => m.ConversationId == conversationId);

        return await ExecuteSearchAsync(query, request);
    }

    /// <summary>
    /// Search messages for a company (in company conversations)
    /// </summary>
    public async Task<IEnumerable<MessageSearchResultDto>> SearchCompanyMessagesAsync(int companyId, MessageSearchRequest request)
    {
        var query = _context.Messages
            .Include(m => m.Conversation)
            .Include(m => m.SenderUser)
            .Include(m => m.Attachments)
            .Where(m => m.Conversation.CompanyId == companyId);

        return await ExecuteSearchAsync(query, request);
    }

    private async Task<IEnumerable<MessageSearchResultDto>> ExecuteSearchAsync(
        IQueryable<Message> query, 
        MessageSearchRequest request)
    {
        // Apply search term filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(m => m.Content.ToLower().Contains(searchTerm));
        }

        // Apply conversation filter
        if (request.ConversationId.HasValue)
        {
            query = query.Where(m => m.ConversationId == request.ConversationId.Value);
        }

        // Apply date filters
        if (request.FromDate.HasValue)
        {
            query = query.Where(m => m.CreatedAt >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(m => m.CreatedAt <= request.ToDate.Value);
        }

        // Apply attachment filter
        if (request.HasAttachments.HasValue && request.HasAttachments.Value)
        {
            query = query.Where(m => m.Attachments.Any());
        }

        // Order by date descending and apply pagination
        var messages = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return messages.Select(m => new MessageSearchResultDto
        {
            MessageId = m.Id,
            ConversationId = m.ConversationId,
            ConversationTitle = m.Conversation?.Company?.Name ?? "Unknown",
            Content = m.Content,
            ContentSnippet = GetContentSnippet(m.Content, request.SearchTerm),
            SenderId = m.SenderUserId,
            SenderName = m.SenderUser?.FullName ?? m.SenderUser?.Email ?? "Unknown",
            SenderAvatar = null,
            IsFromCompany = m.IsFromCompany,
            CreatedAt = m.CreatedAt,
            CompanyName = m.Conversation?.Company?.Name ?? "Unknown",
            CompanyId = m.Conversation?.CompanyId ?? 0,
            HasAttachments = m.Attachments?.Any() ?? false,
            Attachments = m.Attachments?.Select(a => new MessageAttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                OriginalFileName = a.OriginalFileName,
                FilePath = a.FilePath,
                FileType = a.FileType,
                FileSize = a.FileSize,
                UploadedAt = a.UploadedAt
            }).ToList() ?? new List<MessageAttachmentDto>()
        });
    }

    private string GetContentSnippet(string content, string? searchTerm)
    {
        const int snippetLength = 150;
        
        if (string.IsNullOrEmpty(content))
            return string.Empty;

        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return content.Length <= snippetLength 
                ? content 
                : content.Substring(0, snippetLength) + "...";
        }

        // Find the position of the search term
        var index = content.ToLower().IndexOf(searchTerm.ToLower());
        
        if (index < 0)
        {
            return content.Length <= snippetLength 
                ? content 
                : content.Substring(0, snippetLength) + "...";
        }

        // Calculate snippet start position to center around the search term
        var start = Math.Max(0, index - snippetLength / 2);
        var length = Math.Min(snippetLength, content.Length - start);

        var snippet = content.Substring(start, length);
        
        if (start > 0)
            snippet = "..." + snippet;
        
        if (start + length < content.Length)
            snippet = snippet + "...";

        return snippet;
    }

    // ── Private Helper Methods ────────────────────────────────────────────────────

    private async Task<MessageFileAttachment> SaveAttachmentAsync(IFormFile file, Message message, int? companyId)
    {
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var result = await _fileStorage.SaveFileAsync(file, "message-attachments");

        return new MessageFileAttachment
        {
            CompanyId = companyId,
            MessageId = message.Id,
            FileName = fileName,
            OriginalFileName = file.FileName,
            FilePath = result.Path,
            FileType = file.ContentType,
            FileSize = file.Length,
            UploadedAt = DateTime.UtcNow
        };
    }

    private async Task<ConversationDto> MapToConversationDto(Conversation conversation, int userId, bool isCompanyOwner = false)
    {
        var unreadCount = await _context.Messages
            .Where(m => m.ConversationId == conversation.Id && !m.IsRead && m.SenderUserId != userId)
            .CountAsync();

        var canSend = await CanUserSendMessageAsync(conversation.Id, userId);

        // Determine Name of the "Other Party"
        var isInitiator = conversation.InitiatorUserId == userId;
        var otherUserId = isInitiator ? conversation.TargetUserId : conversation.InitiatorUserId;
        var otherUser = isInitiator ? conversation.TargetUser : conversation.InitiatorUser;

        // If otherUser is null (not loaded), fetch it
        if (otherUser == null && otherUserId.HasValue)
        {
            otherUser = await _context.Users.FindAsync(otherUserId.Value);
        }

        var otherPartyName = otherUser?.FullName ?? otherUser?.Email ?? "Unknown";
        
        // Contextual names for the UI
        var displayedName = otherPartyName;
        if (conversation.InitiatorUserId == conversation.TargetUserId) 
        {
            displayedName = "Me (Self)";
        }

        return new ConversationDto
        {
            Id = conversation.Id,
            CompanyId = conversation.CompanyId ?? 0,
            CompanyName = displayedName,
            CompanyLogo = null,
            InitiatorUserId = conversation.InitiatorUserId,
            InitiatorName = conversation.InitiatorUser?.FullName ?? "User",
            TargetUserId = conversation.TargetUserId,
            TargetUserName = otherPartyName,
            InitiatedBy = conversation.InitiatedBy ?? "User",
            ConversationType = "User", // Simplified to User-to-User
            Status = conversation.Status,
            CreatedAt = conversation.CreatedAt,
            LastMessageAt = conversation.LastMessageAt,
            LastMessage = conversation.LastMessage != null ? MapToCompanyMessageDto(conversation.LastMessage) : null,
            UnreadCount = unreadCount,
            CanSendMessage = canSend.CanSend,
            IsCompanyOwner = isCompanyOwner
        };
    }

    /// <summary>
    /// Determines the conversation type for tabbed interface filtering
    /// </summary>
    private async Task<(string conversationType, string? targetUserType)> DetermineConversationTypeAsync(Conversation conversation, bool isCompanyOwner)
    {
        var company = conversation.Company;

        // If the viewer is NOT the company owner, they are the initiator (User viewing a Company/SystemAdmin)
        if (!isCompanyOwner)
        {
            // Check if talking to SystemAdmin by BusinessId or special CompanyId = 0
            // Strategy 1: Check by BusinessId
            bool isSystemAdminCompany = company?.BusinessId == "SUPER-ADMIN-001" || 
                                      company?.BusinessId == "STRUCT-ADMIN" ||
                                      conversation.CompanyId == 0; // Special ID 0 for SystemAdmin

            // Strategy 2: Check cached SystemAdmin company IDs (avoids N+1 query)
            if (!isSystemAdminCompany && company != null)
            {
                var systemAdminCompanyIds = await GetSystemAdminCompanyIdsAsync();
                isSystemAdminCompany = systemAdminCompanyIds.Contains(company.Id);
            }

            if (isSystemAdminCompany)
            {
                return ("SystemAdmin", null);
            }

            return ("Company", null);
        }

        // The viewer IS the company owner (SystemAdmin or regular company admin viewing Initiator)
        // Categorize by the OTHER party (InitiatorUser)
        var initiator = conversation.InitiatorUser;
        if (initiator != null)
        {
            var typeStr = initiator.UserType switch
            {
                UserType.Worker => "Worker",
                UserType.Engineer => "Worker",
                UserType.NormalUser => "Client",
                UserType.CompanyOwner => "Company",
                UserType.InventoryOwner => "Company",
                UserType.Subcontractor => "Company",
                _ => "Client"
            };
            return (typeStr, typeStr);
        }

        // Fallback for company owner view
        return ("Client", "Client");
    }

    private async Task<ConversationDetailDto> MapToConversationDetailDto(Conversation conversation, int userId, bool isCompanyOwner = false)
    {
        var baseDto = await MapToConversationDto(conversation, userId, isCompanyOwner);
        
        var messages = conversation.Messages
            .OrderBy(m => m.CreatedAt)
            .Select(MapToCompanyMessageDto)
            .ToList();

        return new ConversationDetailDto
        {
            Id = baseDto.Id,
            CompanyId = baseDto.CompanyId,
            CompanyName = baseDto.CompanyName,
            CompanyLogo = baseDto.CompanyLogo,
            InitiatorUserId = baseDto.InitiatorUserId,
            InitiatorName = baseDto.InitiatorName,
            InitiatorAvatar = baseDto.InitiatorAvatar,
            InitiatedBy = baseDto.InitiatedBy,
            ConversationType = baseDto.ConversationType,
            TargetUserType = baseDto.TargetUserType,
            Status = baseDto.Status,
            CreatedAt = baseDto.CreatedAt,
            LastMessageAt = baseDto.LastMessageAt,
            LastMessage = baseDto.LastMessage,
            UnreadCount = baseDto.UnreadCount,
            CanSendMessage = baseDto.CanSendMessage,
            IsCompanyOwner = baseDto.IsCompanyOwner,
            Messages = messages
        };
    }

    private CompanyMessageDto MapToCompanyMessageDto(Message message)
    {
        return new CompanyMessageDto
        {
            Id = message.Id,
            SenderUserId = message.SenderUserId,
            SenderName = message.SenderUser?.FullName ?? message.SenderUser?.Email ?? "Unknown",
            SenderAvatar = null, // User doesn't have profile picture property
            Content = message.Content,
            IsFromCompany = message.IsFromCompany,
            IsRead = message.IsRead,
            ReadAt = message.ReadAt,
            CreatedAt = message.CreatedAt,
            Attachments = message.Attachments?.Select(a => new MessageAttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                OriginalFileName = a.OriginalFileName,
                FilePath = a.FilePath,
                FileType = a.FileType,
                FileSize = a.FileSize,
                UploadedAt = a.UploadedAt
            }).ToList() ?? new List<MessageAttachmentDto>()
        };
    }

    // ── Unverified Owner Restrictions ─────────────────────────────────────────────

    /// <summary>
    /// Check if a user is an unverified company owner (company pending approval)
    /// </summary>
    private async Task<bool> IsUnverifiedCompanyOwnerAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null || user.UserType != UserType.CompanyOwner)
            return false;

        // Check if there's any approved company request for this user
        var approvedRequest = await _context.CompanyRequests
            .FirstOrDefaultAsync(cr => cr.UserId == userId && cr.Status == "Approved");

        // If no approved request exists, user is unverified
        // This covers both cases:
        // 1. User has a CompanyId but company request is not approved yet
        // 2. User doesn't have a CompanyId yet (just registered, pending approval)
        return approvedRequest == null;
    }

    /// <summary>
    /// Check if a user can message a specific company (restriction for unverified owners and workers)
    /// </summary>
    private async Task<bool> CanMessageRecipientAsync(int senderId, int recipientCompanyId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == senderId);
        
        if (user == null) return false;

        // 1. Check if sender is SystemAdmin (by UserType) - they can message anyone
        // SystemAdmin is the user who manages the system, not associated with any company
        if (user.UserType == UserType.SystemAdmin)
        {
            return true;
        }

        // 2. Check if recipient is System Admin company - allow users to message
        if (await IsSystemAdminCompanyAsync(recipientCompanyId))
        {
            return true;
        }

        // 3. Worker/Engineer Restriction: Can ONLY message their own company or System Admin
        if (user.UserType == UserType.Worker || user.UserType == UserType.Engineer)
        {
            // Workers can message their own company or System Admin
            return user.CompanyId == recipientCompanyId;
        }

        // 4. NormalUser Restriction: Cannot message anyone
        if (user.UserType == UserType.NormalUser)
        {
            return false;
        }

        // 5. Unverified Owner Restriction: Can ONLY message SystemAdmin/System Admin
        if (await IsUnverifiedCompanyOwnerAsync(senderId))
        {
            return await IsSystemAdminCompanyAsync(recipientCompanyId);
        }

        // Other users (CompanyOwner, InventoryOwner, Subcontractor) are allowed to message
        return true;
    }

    /// <summary>
    /// Check if a company is the System Admin company
    /// </summary>
    private async Task<bool> IsSystemAdminCompanyAsync(int companyId)
    {
        var company = await _context.Companies.FindAsync(companyId);
        if (company == null) return false;
        
        // Check by BusinessId or known System Admin company ID
        return company.BusinessId == "SYSTEM-ADMIN" || 
               company.Name.Contains("System", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Get messaging restriction status for a user
    /// </summary>
    public async Task<MessagingStatusDto> GetMessagingStatusAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return new MessagingStatusDto();

        var isUnverifiedOwner = await IsUnverifiedCompanyOwnerAsync(userId);
        var isWorker = user.UserType == UserType.Worker;

        var status = new MessagingStatusDto
        {
            IsUnverifiedCompanyOwner = isUnverifiedOwner,
            IsWorker = isWorker,
            UserCompanyId = user.CompanyId,
            IsRestricted = isUnverifiedOwner || isWorker,
            SystemAdminCompanyId = await GetSystemAdminCompanyIdAsync(),
            SystemAdminUserId = await GetSystemAdminUserIdAsync()
        };

        if (status.IsRestricted)
        {
            if (isUnverifiedOwner)
            {
                status.RestrictionReason = "Your company is pending approval. You can only message SystemAdmin.";
            }
            else if (isWorker)
            {
                status.RestrictionReason = "As a worker, you can only message your own company workers and owner.";
                // For workers, IsRestricted is true, but they can still message their OWN company.
                // We'll handle the specific check in the UI by comparing CompanyId with UserCompanyId.
            }
        }

        return status;
    }

    private async Task<int?> GetSystemAdminCompanyIdAsync()
    {
        int? SystemAdminCompanyId = null;

        // Strategy 1: Find a SystemAdmin user with a company assigned
        var SystemAdminWithCompany = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .Where(u => u.UserRoles.Any(ur => ur.Role.Name == "SystemAdmin") && u.CompanyId.HasValue)
            .Select(u => u.CompanyId)
            .FirstOrDefaultAsync();

        if (SystemAdminWithCompany.HasValue && SystemAdminWithCompany.Value > 0)
        {
            SystemAdminCompanyId = SystemAdminWithCompany;
            _logger.LogInformation("Found SystemAdmin company via user with CompanyId: {CompanyId}", SystemAdminCompanyId);
        }

        // Strategy 2: Find any company that has SystemAdmin users assigned to it
        if (!SystemAdminCompanyId.HasValue || SystemAdminCompanyId.Value == 0)
        {
            var companyWithSystemAdmin = await (from u in _context.Users
                                               join ur in _context.UserRoles on u.Id equals ur.UserId
                                               join r in _context.Roles on ur.RoleId equals r.Id
                                               where r.Name == "SystemAdmin" && u.CompanyId.HasValue
                                               select u.CompanyId!.Value)
                .FirstOrDefaultAsync();

            if (companyWithSystemAdmin > 0)
            {
                SystemAdminCompanyId = companyWithSystemAdmin;
                _logger.LogInformation("Found company with SystemAdmin users: {CompanyId}", SystemAdminCompanyId);
            }
        }

        // Strategy 3: Get the first company that exists in the system
        if (!SystemAdminCompanyId.HasValue || SystemAdminCompanyId.Value == 0)
        {
            var firstCompany = await _context.Companies
                .OrderBy(c => c.Id)
                .FirstOrDefaultAsync();

            if (firstCompany != null)
            {
                SystemAdminCompanyId = firstCompany.Id;
                _logger.LogInformation("Using first company as fallback: {CompanyId}", SystemAdminCompanyId);
            }
        }

        // Strategy 4: Return 0 as special SystemAdmin company ID (virtual, not in database)
        // This allows SystemAdmin messaging without an actual company
        if (!SystemAdminCompanyId.HasValue || SystemAdminCompanyId.Value == 0)
        {
            _logger.LogInformation("No company found for SystemAdmin - using special ID 0 for SystemAdmin messaging.");
            return 0; // Special ID 0 represents SystemAdmin in messaging
        }
        return SystemAdminCompanyId;
    }

    /// <summary>
    /// Get the SystemAdmin user ID for direct messaging
    /// </summary>
    private async Task<int?> GetSystemAdminUserIdAsync()
    {
        // First try to find by role
        var SystemAdmin = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .Where(u => u.UserRoles.Any(ur => ur.Role.Name == "SystemAdmin"))
            .OrderBy(u => u.Id)
            .Select(u => u.Id)
            .FirstOrDefaultAsync();

        if (SystemAdmin > 0) return SystemAdmin;

        // Fallback: find by known SystemAdmin email
        var adminByEmail = await _context.Users
            .Where(u => u.Email.ToLower() == "admin@construction.com")
            .Select(u => u.Id)
            .FirstOrDefaultAsync();

        return adminByEmail > 0 ? adminByEmail : null;
    }

    // ── Company to User Messaging ─────────────────────────────────────────────────

    /// <summary>
    /// Start a new conversation from a company to a user (client/worker)
    /// </summary>
    public async Task<ConversationDto> StartConversationWithUserAsync(int companyOwnerId, StartConversationWithUserRequest request, List<IFormFile>? attachments = null)
    {
        // Verify the user is a company owner
        var companyOwner = await _context.Users.FindAsync(companyOwnerId);
        if (companyOwner == null || !companyOwner.CompanyId.HasValue)
        {
            throw new UnauthorizedAccessException("Only company owners can initiate conversations with users.");
        }

        // Verify the target user exists and is a client or worker
        var targetUser = await _context.Users.FindAsync(request.TargetUserId);
        if (targetUser == null)
        {
            throw new InvalidOperationException("Target user not found.");
        }

        // Only allow messaging NormalUser (clients) and Worker types
        if (targetUser.UserType != UserType.NormalUser && targetUser.UserType != UserType.Worker)
        {
            throw new InvalidOperationException("Companies can only initiate conversations with clients (NormalUser) and workers (Worker).");
        }

        // Verify the target user belongs to the company owner's company
        if (targetUser.CompanyId != companyOwner.CompanyId)
        {
            throw new InvalidOperationException("You can only message users who belong to your company.");
        }

        // Check if there's already an existing conversation
        var existingConversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.CompanyId == companyOwner.CompanyId && 
                                      c.InitiatorUserId == request.TargetUserId &&
                                      c.InitiatedBy == "Company");

        if (existingConversation != null)
        {
            throw new InvalidOperationException("You already have a conversation with this user. Please continue in the existing conversation.");
        }

        // Also check for user-initiated conversation with this company
        var userInitiatedConversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.CompanyId == companyOwner.CompanyId && 
                                      c.InitiatorUserId == request.TargetUserId &&
                                      c.InitiatedBy == "User");

        if (userInitiatedConversation != null)
        {
            throw new InvalidOperationException("This user already has a conversation with your company. Please continue in the existing conversation.");
        }

        // Create conversation - company initiated, so it's auto-approved
        var conversation = new Conversation
        {
            CompanyId = companyOwner.CompanyId.Value,
            InitiatorUserId = request.TargetUserId, // The user being messaged
            InitiatedBy = "Company", // Company initiated
            Status = "Approved", // Auto-approve since company initiated
            CreatedAt = DateTime.UtcNow,
            ApprovedAt = DateTime.UtcNow,
            ApprovedByUserId = companyOwnerId
        };

        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync();

        // Create initial message from company
        var message = new Message
        {
            CompanyId = companyOwner.CompanyId.Value,
            ConversationId = conversation.Id,
            SenderUserId = companyOwnerId,
            Content = request.Message,
            IsFromCompany = true,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);

        // Handle attachments
        if (attachments != null && attachments.Count > 0)
        {
            foreach (var file in attachments)
            {
                var attachment = await SaveAttachmentAsync(file, message, companyOwner.CompanyId.Value);
                _context.MessageFileAttachments.Add(attachment);
            }
        }

        // Update conversation with last message info
        conversation.LastMessageId = message.Id;
        conversation.LastMessageAt = message.CreatedAt;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Company owner {CompanyOwnerId} started conversation {ConversationId} with user {TargetUserId}", 
            companyOwnerId, conversation.Id, request.TargetUserId);

        return await MapToConversationDto(conversation, companyOwnerId, isCompanyOwner: true);
    }

    /// <summary>
    /// Get users that a company can message (clients and workers from the company)
    /// Company owners can only message users that belong to their company
    /// </summary>
    public async Task<IEnumerable<MessagableUserDto>> GetMessagableUsersAsync(int companyId, string? userType = null)
    {
        // Get users that belong to this company (clients and workers associated with the company)
        var query = _context.Users
            .Where(u => u.CompanyId == companyId && (u.UserType == UserType.NormalUser || u.UserType == UserType.Worker));

        // Apply filter if specified
        if (!string.IsNullOrEmpty(userType))
        {
            if (userType.Equals("Client", StringComparison.OrdinalIgnoreCase) || 
                userType.Equals("NormalUser", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(u => u.UserType == UserType.NormalUser);
            }
            else if (userType.Equals("Worker", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(u => u.UserType == UserType.Worker);
            }
        }

        var users = await query
            .OrderBy(u => u.FullName)
            .Take(100) // Limit results
            .ToListAsync();

        // Get existing conversations for this company
        var existingConversations = await _context.Conversations
            .Where(c => c.CompanyId == companyId)
            .ToDictionaryAsync(c => c.InitiatorUserId, c => (int?)c.Id);

        var result = new List<MessagableUserDto>();
        foreach (var user in users)
        {
            var dto = new MessagableUserDto
            {
                Id = user.Id,
                Name = user.FullName ?? user.Email ?? "Unknown",
                Email = user.Email,
                Phone = user.Phone,
                UserType = user.UserType.ToString(),
                ProfilePicture = user.ProfileImageUrl,
                HasExistingConversation = existingConversations.ContainsKey(user.Id),
                ExistingConversationId = existingConversations.GetValueOrDefault(user.Id)
            };
            result.Add(dto);
        }

        return result;
    }

    /// <summary>
    /// Start a new conversation between two workers in the same company
    /// </summary>
    public async Task<ConversationDto> StartWorkerConversationAsync(int initiatorId, StartWorkerConversationRequest request, List<IFormFile>? attachments = null)
    {
        var initiator = await _context.Users.FindAsync(initiatorId);
        var target = await _context.Users.FindAsync(request.TargetWorkerId);

        if (initiator == null || target == null)
            throw new InvalidOperationException("User not found.");

        if (initiator.CompanyId == null || target.CompanyId == null || initiator.CompanyId != target.CompanyId)
            throw new InvalidOperationException("You can only message workers within your own company.");

        // Check for existing worker-to-worker conversation
        var existingConversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.CompanyId == initiator.CompanyId && 
                                      ((c.InitiatorUserId == initiatorId && c.TargetUserId == request.TargetWorkerId) ||
                                       (c.InitiatorUserId == request.TargetWorkerId && c.TargetUserId == initiatorId)) &&
                                      c.InitiatedBy == "Worker");

        if (existingConversation != null)
        {
            // If exists, just send the message there
            await SendMessageAsync(existingConversation.Id, initiatorId, new SendMessageRequest { Content = request.Message }, attachments);
            return await MapToConversationDto(existingConversation, initiatorId);
        }

        // Create new internal conversation
        var conversation = new Conversation
        {
            CompanyId = initiator.CompanyId,
            InitiatorUserId = initiatorId,
            TargetUserId = request.TargetWorkerId,
            InitiatedBy = "Worker",
            Status = "Approved", // Internal worker messaging is auto-approved
            CreatedAt = DateTime.UtcNow
        };

        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync();

        // Create initial message
        var message = new Message
        {
            CompanyId = initiator.CompanyId,
            ConversationId = conversation.Id,
            SenderUserId = initiatorId,
            Content = request.Message,
            IsFromCompany = false, // Not using the "Company" persona, it's personal
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        if (attachments != null && attachments.Count > 0)
        {
            foreach (var file in attachments)
            {
                var attachment = await SaveAttachmentAsync(file, message, initiator.CompanyId.Value);
                _context.MessageFileAttachments.Add(attachment);
            }
            await _context.SaveChangesAsync();
        }

        conversation.LastMessageId = message.Id;
        conversation.LastMessageAt = message.CreatedAt;
        await _context.SaveChangesAsync();

        return await MapToConversationDto(conversation, initiatorId);
    }

    /// <summary>
    /// Get users that SystemAdmin can message (all company owners and other SystemAdmins)
    /// </summary>
    public async Task<IEnumerable<MessagableUserDto>> GetMessagableUsersForSystemAdminAsync(int systemAdminUserId, string? userType = null)
    {
        // Get all company owners AND all SystemAdmins
        var query = _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .Where(u => (u.UserType == UserType.CompanyOwner && u.CompanyId != null) 
                        || u.UserRoles.Any(ur => ur.Role.Name == "SystemAdmin"))
            .AsQueryable();

        if (!string.IsNullOrEmpty(userType))
        {
            query = query.Where(u => u.UserType.ToString() == userType);
        }

        var users = await query
            .Select(u => new MessagableUserDto
            {
                Id = u.Id,
                Name = u.FullName ?? u.Username,
                Email = u.Email,
                Phone = u.Phone,
                UserType = u.UserType.ToString(),
                ProfilePicture = u.ProfileImageUrl
            })
            .ToListAsync();

        return users;
    }
}

