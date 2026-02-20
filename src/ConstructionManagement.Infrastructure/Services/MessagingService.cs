using ConstructionManagement.Application.DTOs.Messaging;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
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

        // Create conversation
        var conversation = new CompanyConversation
        {
            CompanyId = request.CompanyId,
            InitiatorUserId = userId,
            Status = "Pending",
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

        // Handle attachments
        if (attachments != null && attachments.Count > 0)
        {
            foreach (var file in attachments)
            {
                var attachment = await SaveAttachmentAsync(file, message, request.CompanyId);
                _context.MessageFileAttachments.Add(attachment);
            }
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
        var conversations = await _context.CompanyConversations
            .Include(c => c.Company)
            .Include(c => c.InitiatorUser)
            .Include(c => c.LastMessage)
            .Where(c => c.InitiatorUserId == userId)
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

        // Check access - user must be either initiator or company owner
        var isInitiator = conversation.InitiatorUserId == userId;
        var user = await _context.Users.FindAsync(userId);
        var isCompanyOwner = user != null && user.CompanyId == conversation.CompanyId;

        if (!isInitiator && !isCompanyOwner)
        {
            throw new UnauthorizedAccessException("You do not have access to this conversation.");
        }

        // Mark messages as read
        await MarkMessagesAsReadAsync(conversationId, userId);

        return await MapToConversationDetailDto(conversation, userId, isCompanyOwner);
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

        // For initiators, check if conversation is approved
        if (conversation.Status == "Pending")
        {
            // Check if this is the first message (which was already sent)
            var messageCount = await _context.CompanyMessages
                .CountAsync(m => m.ConversationId == conversationId && !m.IsFromCompany);

            if (messageCount == 0)
            {
                // This shouldn't happen as initial message is sent on conversation creation
                return new CanSendMessageResult { CanSend = true };
            }

            return new CanSendMessageResult 
            { 
                CanSend = false, 
                Reason = "Your conversation is pending approval. Please wait for the company to approve before sending more messages.",
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

        return new ConversationDto
        {
            Id = conversation.Id,
            CompanyId = conversation.CompanyId ?? 0,
            CompanyName = conversation.Company?.Name ?? "Unknown Company",
            CompanyLogo = conversation.Company?.LogoUrl,
            InitiatorUserId = conversation.InitiatorUserId,
            InitiatorName = conversation.InitiatorUser?.FullName ?? conversation.InitiatorUser?.Email ?? "Unknown",
            InitiatorAvatar = null, // User doesn't have profile picture property
            Status = conversation.Status,
            CreatedAt = conversation.CreatedAt,
            LastMessageAt = conversation.LastMessageAt,
            LastMessage = conversation.LastMessage != null ? MapToMessageDto(conversation.LastMessage) : null,
            UnreadCount = unreadCount,
            CanSendMessage = canSend.CanSend,
            IsCompanyOwner = isCompanyOwner
        };
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
}
