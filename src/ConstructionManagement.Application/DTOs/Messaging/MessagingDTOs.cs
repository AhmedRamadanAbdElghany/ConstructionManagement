using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs.Messaging;

/// <summary>
/// Request to start a new conversation with a company
/// </summary>
public class StartConversationRequest
{
    public int CompanyId { get; set; }
    public string Message { get; set; } = string.Empty;
}

    /// <summary>
    /// Conversation summary for list views
    /// </summary>
    public class ConversationDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? CompanyLogo { get; set; }
        public int InitiatorUserId { get; set; }
        public string InitiatorName { get; set; } = string.Empty;
        public string? InitiatorAvatar { get; set; }
        
        /// <summary>
        /// Who initiated the conversation: "User" or "Company"
        /// </summary>
        public string InitiatedBy { get; set; } = "User";
        
        /// <summary>
        /// Type of conversation: "Company", "Worker", "Client", "SuperAdmin"
        /// Used for tabbed interface filtering
        /// </summary>
        public string ConversationType { get; set; } = "Company";
        
        /// <summary>
        /// User type of the other party in the conversation (for Company-initiated conversations)
        /// </summary>
        public string? TargetUserType { get; set; }
        
        /// <summary>
        /// Status: Pending, Approved, Blocked
        /// </summary>
        public string Status { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public CompanyMessageDto? LastMessage { get; set; }
        
        /// <summary>
        /// Number of unread messages for the current user
        /// </summary>
        public int UnreadCount { get; set; }
        
        /// <summary>
        /// Whether the current user can send a message
        /// </summary>
        public bool CanSendMessage { get; set; }
        
        /// <summary>
        /// Whether the current user is the company owner
        /// </summary>
        public bool IsCompanyOwner { get; set; }
        public int? TargetUserId { get; set; }
        public string? TargetUserName { get; set; }
    }

/// <summary>
/// Detailed conversation with all messages
/// </summary>
public class ConversationDetailDto : ConversationDto
{
    public List<CompanyMessageDto> Messages { get; set; } = new();
}

/// <summary>
/// Message in a conversation
/// </summary>
public class CompanyMessageDto
{
    public int Id { get; set; }
    public int SenderUserId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string? SenderAvatar { get; set; }
    public string Content { get; set; } = string.Empty;
    
    /// <summary>
    /// True if sent by company owner/admin, false if sent by conversation initiator
    /// </summary>
    public bool IsFromCompany { get; set; }
    
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<MessageAttachmentDto> Attachments { get; set; } = new();
}

/// <summary>
/// File attachment on a message
/// </summary>
public class MessageAttachmentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
    
    /// <summary>
    /// URL to download the file
    /// </summary>
    public string? DownloadUrl { get; set; }
}

/// <summary>
/// Request to send a message in an existing conversation
/// </summary>
public class SendMessageRequest
{
    public string Content { get; set; } = string.Empty;
}

/// <summary>
/// Request to approve a conversation
/// </summary>
public class ApproveConversationRequest
{
    public string? Notes { get; set; }
}

/// <summary>
/// Request to block a user from messaging
/// </summary>
public class BlockUserRequest
{
    public int UserId { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Request to block a conversation
/// </summary>
public class BlockConversationRequest
{
    public string? Reason { get; set; }
}

/// <summary>
/// Blocked user information
/// </summary>
public class BlockedUserDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserEmail { get; set; }
    public string? Reason { get; set; }
    public DateTime BlockedAt { get; set; }
    public string BlockedByName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

/// <summary>
/// Result of checking if user can send message
/// </summary>
public class CanSendMessageResult
{
    public bool CanSend { get; set; }
    public string? Reason { get; set; }
    public string? Status { get; set; }
}

/// <summary>
/// Detailed public company information with portfolio
/// </summary>
public class PublicCompanyDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Address { get; set; }
    public int FollowerCount { get; set; }
    public int PortfolioItemCount { get; set; }
    public bool IsFollowedByCurrentUser { get; set; }
    public string? BusinessId { get; set; }
    public List<PortfolioItemDto> PortfolioItems { get; set; } = new();
    public List<PortfolioCategoryDto> PortfolioCategories { get; set; } = new();
}

/// <summary>
/// Portfolio item for public display
/// </summary>
public class PortfolioItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public string? FileType { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public DateTime? CompletionDate { get; set; }
    public string? ClientName { get; set; }
    public string? Location { get; set; }
}

/// <summary>
/// Portfolio category for grouping items
/// </summary>
public class PortfolioCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ItemCount { get; set; }
}

/// <summary>
/// Request to search messages
/// </summary>
public class MessageSearchRequest
{
    public string SearchTerm { get; set; } = string.Empty;
    public int? ConversationId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public bool? HasAttachments { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Search result for messages
/// </summary>
public class MessageSearchResultDto
{
    public int MessageId { get; set; }
    public int ConversationId { get; set; }
    public string ConversationTitle { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    
    /// <summary>
    /// Highlighted content snippet with search term highlighted
    /// </summary>
    public string ContentSnippet { get; set; } = string.Empty;
    
    public int SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string? SenderAvatar { get; set; }
    public bool IsFromCompany { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public bool HasAttachments { get; set; }
    public List<MessageAttachmentDto> Attachments { get; set; } = new();
}

/// <summary>
/// Messaging restriction status for a user
/// </summary>
public class MessagingStatusDto
{
    /// <summary>
    /// Whether the user has restricted messaging
    /// </summary>
    public bool IsRestricted { get; set; }
    
    /// <summary>
    /// Reason for restriction if applicable
    /// </summary>
    public string? RestrictionReason { get; set; }
    
    /// <summary>
    /// Company ID of SuperAdmin if restricted (the only allowed recipient)
    /// </summary>
    public int? SuperAdminCompanyId { get; set; }
    
    /// <summary>
    /// Whether the user is an unverified company owner
    /// </summary>
    public bool IsUnverifiedCompanyOwner { get; set; }

    /// <summary>
    /// Whether the user is a worker
    /// </summary>
    public bool IsWorker { get; set; }

    /// <summary>
    /// The user's home company ID
    /// </summary>
    public int? UserCompanyId { get; set; }
}

/// <summary>
/// Request to start a new conversation from a company to a user
/// </summary>
public class StartConversationWithUserRequest
{
    /// <summary>
    /// The target user ID (client or worker)
    /// </summary>
    public int TargetUserId { get; set; }
    
    /// <summary>
    /// The initial message content
    /// </summary>
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// User that can be messaged by a company
/// </summary>
public class MessagableUserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string UserType { get; set; } = string.Empty;
    public string? ProfilePicture { get; set; }
    
    /// <summary>
    /// Whether there's an existing conversation with this user
    /// </summary>
    public bool HasExistingConversation { get; set; }
    
    /// <summary>
    /// Existing conversation ID if any
    /// </summary>
    public int? ExistingConversationId { get; set; }
}

/// <summary>
/// Request to start a new conversation between workers
/// </summary>
public class StartWorkerConversationRequest
{
    public int TargetWorkerId { get; set; }
    public string Message { get; set; } = string.Empty;
}
