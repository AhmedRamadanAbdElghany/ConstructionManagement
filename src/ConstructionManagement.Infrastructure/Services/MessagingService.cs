using ConstructionManagement.Application.DTOs.Messaging;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for managing company messaging system
/// </summary>
public class MessagingService : IMessagingService
{
    private readonly ApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<MessagingService> _logger;

    public MessagingService(
        ApplicationDbContext context,
        IFileStorageService fileStorage,
        ILogger<MessagingService> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    // ── Conversation Management ──────────────────────────────────────────────────

    public async Task<ConversationDto> StartConversationAsync(int userId, StartConversationRequest request, List<IFormFile>? attachments = null)
    {
        // Check if user can message this company (restriction for unverified owners)
        if (!await CanMessageRecipientAsync(userId, request.CompanyId))
        {
            throw new InvalidOperationException(
                "Your company is pending approval. You can only message SuperAdmin until your company is approved.");
        }

        // Check if user is blocked
        var isBlocked = await IsUserBlockedAsync(request.CompanyId, userId);
        if (isBlocked)
        {
            throw new InvalidOperationException("You are blocked from messaging this company.");
        }

        // Check if there's already an existing conversation
        var existingConversation = await _context.CompanyConversations
            .FirstOrDefaultAsync(c => c.CompanyId == request.CompanyId && c.InitiatorUserId == userId);

        if (existingConversation != null)
        {
            throw new InvalidOperationException("You already have a conversation with this company. Please continue in the existing conversation.");
        }

        // Get company to set CompanyId properly
        var company = await _context.Companies.FindAsync(request.CompanyId);
        if (company == null)
        {
            throw new InvalidOperationException("Company not found.");
        }

        // Check if user belongs to this company (auto-approve for own company)
        var user = await _context.Users.FindAsync(userId);
        var isOwnCompany = user != null && user.CompanyId == request.CompanyId;
        
        // Check if this is a SuperAdmin company (auto-approve for SuperAdmin)
        var isSuperAdminCompany = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .AnyAsync(u => u.CompanyId == request.CompanyId &&
                           u.UserRoles.Any(ur => ur.Role.Name == "SuperAdmin"));
        
        // Also check if this is the System Administration company
        if (!isSuperAdminCompany)
        {
            isSuperAdminCompany = await _context.Companies
                .AnyAsync(c => c.Id == request.CompanyId && c.BusinessId == "SYSTEM-ADMIN");
        }
        
        // Create conversation - auto-approve if:
        // 1. User is messaging their own company
        // 2. User is messaging SuperAdmin
        var shouldAutoApprove = isOwnCompany || isSuperAdminCompany;
        
        var conversation = new CompanyConversation
        {
            CompanyId = request.CompanyId,
            InitiatorUserId = userId,
            Status = shouldAutoApprove ? "Approved" : "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.CompanyConversations.Add(conversation);
        await _context.SaveChangesAsync();

        // Create initial message
        var message = new CompanyMessage
        {
            CompanyId = request.CompanyId,
            ConversationId = conversation.Id,
            SenderUserId = userId,
            Content = request.Message,
            IsFromCompany = false,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.CompanyMessages.Add(message);
        await _context.SaveChangesAsync(); // Save message first to get the ID

        // Handle attachments
        if (attachments != null && attachments.Count > 0)
        {
            foreach (var file in attachments)
            {
                var attachment = await SaveAttachmentAsync(file, message, request.CompanyId);
                _context.MessageFileAttachments.Add(attachment);
            }
            await _context.SaveChangesAsync(); // Save attachments
        }

        // Update conversation with last message info
        conversation.LastMessageId = message.Id;
        conversation.LastMessageAt = message.CreatedAt;

        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} started conversation {ConversationId} with company {CompanyId}", 
            userId, conversation.Id, request.CompanyId);

        return await MapToConversationDto(conversation, userId);
    }

    public async Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(int userId)
    {
        // Get conversations where user is the initiator (User → Company)
        // OR where user is the target (Company → User)
        var conversations = await _context.CompanyConversations
            .Include(c => c.Company)
            .Include(c => c.InitiatorUser)
            .Include(c => c.LastMessage)
            .Where(c => c.InitiatorUserId == userId || 
                        (c.InitiatedBy == "Company" && c.InitiatorUserId == userId))
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();

        var result = new List<ConversationDto>();
        foreach (var conv in conversations)
        {
            result.Add(await MapToConversationDto(conv, userId));
        }

        return result;
    }

    public async Task<IEnumerable<ConversationDto>> GetCompanyConversationsAsync(int companyId)
    {
        var conversations = await _context.CompanyConversations
            .Include(c => c.Company)
            .Include(c => c.InitiatorUser)
            .Include(c => c.LastMessage)
            .Where(c => c.CompanyId == companyId)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();

        var result = new List<ConversationDto>();
        foreach (var conv in conversations)
        {
            // For company owner view, we need to get the company owner's ID
            var companyOwner = await _context.Users
                .Where(u => u.CompanyId == companyId && u.UserType == Domain.Enums.UserType.CompanyOwner)
                .FirstOrDefaultAsync();
            
            var userId = companyOwner?.Id ?? 0;
            result.Add(await MapToConversationDto(conv, userId, isCompanyOwner: true));
        }

        return result;
    }

    public async Task<ConversationDetailDto> GetConversationAsync(int conversationId, int userId)
    {
        var conversation = await _context.CompanyConversations
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

        // Check access - user must be either initiator, company owner, or SuperAdmin
        var isInitiator = conversation.InitiatorUserId == userId;
        var user = await _context.Users.FindAsync(userId);
        var isCompanyOwner = user != null && user.CompanyId == conversation.CompanyId;
        
        // Check if user is SuperAdmin - SuperAdmin can access ANY conversation
        var isSuperAdmin = await _context.UserRoles
            .Include(ur => ur.Role)
            .AnyAsync(ur => ur.UserId == userId && ur.Role.Name == "SuperAdmin");

        if (!isInitiator && !isCompanyOwner && !isSuperAdmin)
        {
            throw new UnauthorizedAccessException("You do not have access to this conversation.");
        }

        // Auto-approve conversation if SuperAdmin opens it for the first time and it's pending
        // This handles conversations created before auto-approval was implemented
        if (isSuperAdmin && conversation.Status == "Pending")
        {
            // Check if this conversation is with SuperAdmin's company
            var isSuperAdminCompany = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AnyAsync(u => u.CompanyId == conversation.CompanyId &&
                               u.UserRoles.Any(ur => ur.Role.Name == "SuperAdmin"));
            
            if (!isSuperAdminCompany)
            {
                isSuperAdminCompany = await _context.Companies
                    .AnyAsync(c => c.Id == conversation.CompanyId && c.BusinessId == "SYSTEM-ADMIN");
            }

            if (isSuperAdminCompany)
            {
                // Auto-approve the conversation
                conversation.Status = "Approved";
                conversation.ApprovedAt = DateTime.UtcNow;
                conversation.ApprovedByUserId = userId;
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Conversation {ConversationId} auto-approved by SuperAdmin {UserId}", 
                    conversationId, userId);
            }
        }

        // Mark messages as read
        await MarkMessagesAsReadAsync(conversationId, userId);

        return await MapToConversationDetailDto(conversation, userId, isCompanyOwner || isSuperAdmin);
    }

    // ── Messaging ────────────────────────────────────────────────────────────────

    public async Task<CompanyMessageDto> SendMessageAsync(int conversationId, int senderId, SendMessageRequest request, List<IFormFile>? attachments = null)
    {
        var conversation = await _context.CompanyConversations
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
                "Your company is pending approval. You can only message SuperAdmin until your company is approved.");
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

        var message = new CompanyMessage
        {
            CompanyId = conversation.CompanyId,
            ConversationId = conversationId,
            SenderUserId = senderId,
            Content = request.Content,
            IsFromCompany = isFromCompany,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.CompanyMessages.Add(message);
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

        return MapToMessageDto(message);
    }

    public async Task<CanSendMessageResult> CanUserSendMessageAsync(int conversationId, int userId)
    {
        var conversation = await _context.CompanyConversations.FindAsync(conversationId);
        if (conversation == null)
        {
            return new CanSendMessageResult { CanSend = false, Reason = "Conversation not found." };
        }

        // Check if user is participant
        var user = await _context.Users.FindAsync(userId);
        var isInitiator = conversation.InitiatorUserId == userId;
        var isCompanyOwner = user != null && user.CompanyId == conversation.CompanyId;

        if (!isInitiator && !isCompanyOwner)
        {
            return new CanSendMessageResult { CanSend = false, Reason = "You are not a participant in this conversation." };
        }

        // Check if conversation is blocked
        if (conversation.Status == "Blocked")
        {
            return new CanSendMessageResult { CanSend = false, Reason = "This conversation has been blocked.", Status = "Blocked" };
        }

        // Check if user is blocked at company level
        if (await IsUserBlockedAsync(conversation.CompanyId ?? 0, userId))
        {
            return new CanSendMessageResult { CanSend = false, Reason = "You are blocked from messaging this company." };
        }

        // Company owner can always send messages
        if (isCompanyOwner)
        {
            return new CanSendMessageResult { CanSend = true };
        }

        // Check if user is messaging their own company - always allow
        if (isInitiator && user != null && user.CompanyId == conversation.CompanyId)
        {
            return new CanSendMessageResult { CanSend = true, Status = conversation.Status };
        }

        // Check if messaging SuperAdmin company - always allow
        var isSuperAdminCompany = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .AnyAsync(u => u.CompanyId == conversation.CompanyId &&
                           u.UserRoles.Any(ur => ur.Role.Name == "SuperAdmin"));
        
        if (!isSuperAdminCompany)
        {
            isSuperAdminCompany = await _context.Companies
                .AnyAsync(c => c.Id == conversation.CompanyId && c.BusinessId == "SYSTEM-ADMIN");
        }
        
        if (isSuperAdminCompany)
        {
            return new CanSendMessageResult { CanSend = true, Status = conversation.Status };
        }

        // 3. Worker restriction: Can ONLY message their own company
        if (user?.UserType == UserType.Worker && user.CompanyId != conversation.CompanyId)
        {
            return new CanSendMessageResult { CanSend = false, Reason = "As a worker, you can only message your own company workers and owner." };
        }

        // Check if conversation is approved 
        if (conversation.Status == "Pending")
        {
            // Unverified companies or companies the user doesn't belong to: only one message allowed
            var messageCount = await _context.CompanyMessages
                .CountAsync(m => m.ConversationId == conversationId && !m.IsFromCompany);

            if (messageCount == 0)
            {
                return new CanSendMessageResult { CanSend = true, Status = "Pending" };
            }

            return new CanSendMessageResult 
            { 
                CanSend = false, 
                Reason = "You have already sent an initial message. Please wait for the company to approve the conversation before sending more messages.",
                Status = "Pending"
            };
        }

        // Approved conversation
        return new CanSendMessageResult { CanSend = true, Status = "Approved" };
    }

    public async Task MarkMessagesAsReadAsync(int conversationId, int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return;

        var conversation = await _context.CompanyConversations.FindAsync(conversationId);
        if (conversation == null) return;

        // Determine which messages to mark as read
        // If user is company owner, mark messages from initiator as read
        // If user is initiator, mark messages from company as read
        var isCompanyOwner = user.CompanyId == conversation.CompanyId;

        var messagesToUpdate = await _context.CompanyMessages
            .Where(m => m.ConversationId == conversationId && !m.IsRead)
            .Where(m => isCompanyOwner ? !m.IsFromCompany : m.IsFromCompany)
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

        if (user.CompanyId.HasValue)
        {
            // Company owner - count unread messages from initiators
            return await _context.CompanyMessages
                .Include(m => m.Conversation)
                .Where(m => m.Conversation.CompanyId == user.CompanyId && !m.IsRead && !m.IsFromCompany)
                .CountAsync();
        }
        else
        {
            // Regular user - count unread messages from companies
            return await _context.CompanyMessages
                .Include(m => m.Conversation)
                .Where(m => m.Conversation.InitiatorUserId == userId && !m.IsRead && m.IsFromCompany)
                .CountAsync();
        }
    }

    // ── Approval/Blocking ────────────────────────────────────────────────────────

    public async Task ApproveConversationAsync(int conversationId, int approverId, string? notes = null)
    {
        var conversation = await _context.CompanyConversations.FindAsync(conversationId);
        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found.");
        }

        // Verify approver is company owner
        var approver = await _context.Users.FindAsync(approverId);
        if (approver == null || approver.CompanyId != conversation.CompanyId)
        {
            throw new UnauthorizedAccessException("Only company owners can approve conversations.");
        }

        conversation.Status = "Approved";
        conversation.ApprovedAt = DateTime.UtcNow;
        conversation.ApprovedByUserId = approverId;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Conversation {ConversationId} approved by user {ApproverId}", 
            conversationId, approverId);
    }

    public async Task BlockConversationAsync(int conversationId, int blockerId, string? reason = null)
    {
        var conversation = await _context.CompanyConversations.FindAsync(conversationId);
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
        var conversation = await _context.CompanyConversations.FindAsync(conversationId);
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
        var conversations = await _context.CompanyConversations
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

        var query = _context.CompanyMessages
            .Include(m => m.Conversation)
            .Include(m => m.SenderUser)
            .Include(m => m.Attachments)
            .Where(m => m.Conversation.InitiatorUserId == userId);

        return await ExecuteSearchAsync(query, request);
    }

    public async Task<IEnumerable<MessageSearchResultDto>> SearchCompanyMessagesAsync(int companyId, MessageSearchRequest request)
    {
        var query = _context.CompanyMessages
            .Include(m => m.Conversation)
            .Include(m => m.SenderUser)
            .Include(m => m.Attachments)
            .Where(m => m.Conversation.CompanyId == companyId);

        return await ExecuteSearchAsync(query, request);
    }

    public async Task<IEnumerable<MessageSearchResultDto>> SearchConversationMessagesAsync(int conversationId, int userId, string searchTerm)
    {
        var user = await _context.Users.FindAsync(userId);
        var conversation = await _context.CompanyConversations.FindAsync(conversationId);

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

        var query = _context.CompanyMessages
            .Include(m => m.Conversation)
            .Include(m => m.SenderUser)
            .Include(m => m.Attachments)
            .Where(m => m.ConversationId == conversationId);

        return await ExecuteSearchAsync(query, request);
    }

    private async Task<IEnumerable<MessageSearchResultDto>> ExecuteSearchAsync(
        IQueryable<CompanyMessage> query, 
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

    private async Task<MessageFileAttachment> SaveAttachmentAsync(IFormFile file, CompanyMessage message, int? companyId)
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

    private async Task<ConversationDto> MapToConversationDto(CompanyConversation conversation, int userId, bool isCompanyOwner = false)
    {
        var unreadCount = await _context.CompanyMessages
            .Where(m => m.ConversationId == conversation.Id && !m.IsRead)
            .Where(m => isCompanyOwner ? !m.IsFromCompany : m.IsFromCompany)
            .CountAsync();

        var canSend = await CanUserSendMessageAsync(conversation.Id, userId);

        // Determine conversation type
        var (conversationType, targetUserType) = DetermineConversationTypeAsync(conversation, isCompanyOwner);

        return new ConversationDto
        {
            Id = conversation.Id,
            CompanyId = conversation.CompanyId ?? 0,
            CompanyName = conversation.Company?.Name ?? "Unknown Company",
            CompanyLogo = conversation.Company?.LogoUrl,
            InitiatorUserId = conversation.InitiatorUserId,
            InitiatorName = conversation.InitiatorUser?.FullName ?? conversation.InitiatorUser?.Email ?? "Unknown",
            InitiatorAvatar = null, // User doesn't have profile picture property
            InitiatedBy = conversation.InitiatedBy ?? "User",
            ConversationType = conversationType,
            TargetUserType = targetUserType,
            Status = conversation.Status,
            CreatedAt = conversation.CreatedAt,
            LastMessageAt = conversation.LastMessageAt,
            LastMessage = conversation.LastMessage != null ? MapToMessageDto(conversation.LastMessage) : null,
            UnreadCount = unreadCount,
            CanSendMessage = canSend.CanSend,
            IsCompanyOwner = isCompanyOwner
        };
    }

    /// <summary>
    /// Determines the conversation type for tabbed interface filtering
    /// </summary>
    private (string conversationType, string? targetUserType) DetermineConversationTypeAsync(CompanyConversation conversation, bool isCompanyOwner)
    {
        var company = conversation.Company;

        // If the viewer is NOT the company owner, they are the initiator (User viewing a Company/SuperAdmin)
        if (!isCompanyOwner)
        {
            // Check if talking to SuperAdmin by BusinessId
            bool isSuperAdminCompany = company?.BusinessId == "SUPER-ADMIN-001" || 
                                     company?.BusinessId == "SYSTEM-ADMIN" || 
                                     company?.BusinessId == "STRUCT-ADMIN";

            if (isSuperAdminCompany)
            {
                return ("SuperAdmin", null);
            }

            return ("Company", null);
        }

        // The viewer IS the company owner (SuperAdmin or regular company admin viewing Initiator)
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

    private async Task<ConversationDetailDto> MapToConversationDetailDto(CompanyConversation conversation, int userId, bool isCompanyOwner = false)
    {
        var baseDto = await MapToConversationDto(conversation, userId, isCompanyOwner);
        
        var messages = conversation.Messages
            .OrderBy(m => m.CreatedAt)
            .Select(MapToMessageDto)
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

    private CompanyMessageDto MapToMessageDto(CompanyMessage message)
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
        var user = await _context.Users.FindAsync(senderId);
        if (user == null) return false;

        // 1. Worker Restriction: Can ONLY message their own company
        if (user.UserType == UserType.Worker)
        {
            return user.CompanyId == recipientCompanyId;
        }

        // 2. Unverified Owner Restriction: Can ONLY message SuperAdmin
        if (await IsUnverifiedCompanyOwnerAsync(senderId))
        {
            // Check if any SuperAdmin is associated with this company
            var hasSuperAdmin = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AnyAsync(u => u.CompanyId == recipientCompanyId &&
                               u.UserRoles.Any(ur => ur.Role.Name == "SuperAdmin"));

            if (hasSuperAdmin)
                return true;

            // Also check if this is the System Administration company
            var isSystemCompany = await _context.Companies
                .AnyAsync(c => c.Id == recipientCompanyId && c.BusinessId == "SYSTEM-ADMIN");

            return isSystemCompany;
        }

        // Other users (Clients, Verified Owners, Admins) are allowed to initiate
        return true;
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
            IsRestricted = isUnverifiedOwner || isWorker
        };

        if (status.IsRestricted)
        {
            if (isUnverifiedOwner)
            {
                status.RestrictionReason = "Your company is pending approval. You can only message SuperAdmin.";
                status.SuperAdminCompanyId = await GetSuperAdminCompanyIdAsync();
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

    private async Task<int?> GetSuperAdminCompanyIdAsync()
    {
        int? superAdminCompanyId = null;

        // Strategy 1: Find a SuperAdmin user with a company assigned
        var superAdminWithCompany = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .Where(u => u.UserRoles.Any(ur => ur.Role.Name == "SuperAdmin") && u.CompanyId.HasValue)
            .Select(u => u.CompanyId)
            .FirstOrDefaultAsync();

        if (superAdminWithCompany.HasValue && superAdminWithCompany.Value > 0)
        {
            superAdminCompanyId = superAdminWithCompany;
            _logger.LogInformation("Found SuperAdmin company via user with CompanyId: {CompanyId}", superAdminCompanyId);
        }

        // Strategy 2: Find any company that has SuperAdmin users assigned to it
        if (!superAdminCompanyId.HasValue || superAdminCompanyId.Value == 0)
        {
            var companyWithSuperAdmin = await (from u in _context.Users
                                               join ur in _context.UserRoles on u.Id equals ur.UserId
                                               join r in _context.Roles on ur.RoleId equals r.Id
                                               where r.Name == "SuperAdmin" && u.CompanyId.HasValue
                                               select u.CompanyId.Value)
                .FirstOrDefaultAsync();

            if (companyWithSuperAdmin > 0)
            {
                superAdminCompanyId = companyWithSuperAdmin;
                _logger.LogInformation("Found company with SuperAdmin users: {CompanyId}", superAdminCompanyId);
            }
        }

        // Strategy 3: Get the first company that exists in the system
        if (!superAdminCompanyId.HasValue || superAdminCompanyId.Value == 0)
        {
            var firstCompany = await _context.Companies
                .OrderBy(c => c.Id)
                .FirstOrDefaultAsync();

            if (firstCompany != null)
            {
                superAdminCompanyId = firstCompany.Id;
                _logger.LogInformation("Using first company as fallback: {CompanyId}", superAdminCompanyId);
            }
        }

        // Strategy 4: Create a system company if none exists
        if (!superAdminCompanyId.HasValue || superAdminCompanyId.Value == 0)
        {
            _logger.LogWarning("No companies found. Creating a system company for SuperAdmin messaging.");
            
            var systemCompany = new Company
            {
                Name = "System Administration",
                BusinessId = "SYSTEM-ADMIN",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            
            _context.Companies.Add(systemCompany);
            await _context.SaveChangesAsync();
            
            superAdminCompanyId = systemCompany.Id;
            _logger.LogInformation("Created system company with ID: {CompanyId}", superAdminCompanyId);
        }
        return superAdminCompanyId;
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
        var existingConversation = await _context.CompanyConversations
            .FirstOrDefaultAsync(c => c.CompanyId == companyOwner.CompanyId && 
                                      c.InitiatorUserId == request.TargetUserId &&
                                      c.InitiatedBy == "Company");

        if (existingConversation != null)
        {
            throw new InvalidOperationException("You already have a conversation with this user. Please continue in the existing conversation.");
        }

        // Also check for user-initiated conversation with this company
        var userInitiatedConversation = await _context.CompanyConversations
            .FirstOrDefaultAsync(c => c.CompanyId == companyOwner.CompanyId && 
                                      c.InitiatorUserId == request.TargetUserId &&
                                      c.InitiatedBy == "User");

        if (userInitiatedConversation != null)
        {
            throw new InvalidOperationException("This user already has a conversation with your company. Please continue in the existing conversation.");
        }

        // Create conversation - company initiated, so it's auto-approved
        var conversation = new CompanyConversation
        {
            CompanyId = companyOwner.CompanyId.Value,
            InitiatorUserId = request.TargetUserId, // The user being messaged
            InitiatedBy = "Company", // Company initiated
            Status = "Approved", // Auto-approve since company initiated
            CreatedAt = DateTime.UtcNow,
            ApprovedAt = DateTime.UtcNow,
            ApprovedByUserId = companyOwnerId
        };

        _context.CompanyConversations.Add(conversation);
        await _context.SaveChangesAsync();

        // Create initial message from company
        var message = new CompanyMessage
        {
            CompanyId = companyOwner.CompanyId.Value,
            ConversationId = conversation.Id,
            SenderUserId = companyOwnerId,
            Content = request.Message,
            IsFromCompany = true,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.CompanyMessages.Add(message);

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
        var existingConversations = await _context.CompanyConversations
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
        var existingConversation = await _context.CompanyConversations
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
        var conversation = new CompanyConversation
        {
            CompanyId = initiator.CompanyId,
            InitiatorUserId = initiatorId,
            TargetUserId = request.TargetWorkerId,
            InitiatedBy = "Worker",
            Status = "Approved", // Internal worker messaging is auto-approved
            CreatedAt = DateTime.UtcNow
        };

        _context.CompanyConversations.Add(conversation);
        await _context.SaveChangesAsync();

        // Create initial message
        var message = new CompanyMessage
        {
            CompanyId = initiator.CompanyId,
            ConversationId = conversation.Id,
            SenderUserId = initiatorId,
            Content = request.Message,
            IsFromCompany = false, // Not using the "Company" persona, it's personal
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.CompanyMessages.Add(message);
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
}
