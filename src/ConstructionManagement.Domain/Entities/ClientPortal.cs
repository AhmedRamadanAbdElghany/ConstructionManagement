namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Client portal settings for a company
    /// </summary>
    public class ClientPortalSettings : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public bool EnableClientPortal { get; set; }
        public bool AllowProjectProgressView { get; set; }
        public bool AllowDocumentAccess { get; set; }
        public bool AllowPaymentHistoryView { get; set; }
        public bool AllowCommunicationHub { get; set; }
        public bool AllowChangeOrderRequests { get; set; }
        public bool RequireApprovalForChangeOrders { get; set; }
        public string? DefaultTheme { get; set; }
        public string? LogoUrl { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Company? Company { get; set; }
    }

    /// <summary>
    /// Client portal user (external client)
    /// </summary>
    public class ClientUser : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? UserId { get; set; } // Link to internal user if applicable
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? JobTitle { get; set; }
        public string PasswordHash { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public bool EmailVerified { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime PasswordChangedAt { get; set; } = DateTime.UtcNow;
        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual User? User { get; set; }
        public virtual ICollection<ClientProjectAccess> ProjectAccesses { get; set; } = new List<ClientProjectAccess>();
        public virtual ICollection<ClientMessage> Messages { get; set; } = new List<ClientMessage>();
        public virtual ICollection<ChangeOrderRequest> ChangeOrderRequests { get; set; } = new List<ChangeOrderRequest>();
    }

    /// <summary>
    /// Client access to specific projects
    /// </summary>
    public class ClientProjectAccess : ICompanyEntity, IProjectEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public int ClientUserId { get; set; }
        public bool CanViewProgress { get; set; }
        public bool CanViewDocuments { get; set; }
        public bool CanViewPayments { get; set; }
        public bool CanSendMessages { get; set; }
        public bool CanRequestChanges { get; set; }
        public DateTime? GrantedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? Notes { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual Project? Project { get; set; }
        public virtual ClientUser? ClientUser { get; set; }
    }

    /// <summary>
    /// Client messages/communication
    /// </summary>
    public class ClientMessage : ICompanyEntity, IProjectEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public int ClientUserId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string MessageType { get; set; } = string.Empty; // Question, Issue, Request, General
        public string Priority { get; set; } = string.Empty; // Low, Medium, High, Urgent
        public string Status { get; set; } = string.Empty; // Open, InProgress, Resolved, Closed
        public DateTime? ReadAt { get; set; }
        public int? AssignedToUserId { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string? Resolution { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual Project? Project { get; set; }
        public virtual ClientUser? ClientUser { get; set; }
        public virtual User? AssignedToUser { get; set; }
        public virtual ICollection<MessageAttachment> Attachments { get; set; } = new List<MessageAttachment>();
        public virtual ICollection<MessageReply> Replies { get; set; } = new List<MessageReply>();
    }

    /// <summary>
    /// Message attachments
    /// </summary>
    public class MessageAttachment : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int MessageId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string UploadedBy { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual ClientMessage? Message { get; set; }
    }

    /// <summary>
    /// Message replies
    /// </summary>
    public class MessageReply : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int MessageId { get; set; }
        public int? ClientUserId { get; set; }
        public int? UserId { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsInternal { get; set; } // Internal notes not visible to client
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual ClientMessage? Message { get; set; }
        public virtual ClientUser? ClientUser { get; set; }
        public virtual User? User { get; set; }
    }

    /// <summary>
    /// Change order requests from clients
    /// </summary>
    public class ChangeOrderRequest : ICompanyEntity, IProjectEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public int ClientUserId { get; set; }
        public string RequestNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // Design, Material, Schedule, Scope, Other
        public string Priority { get; set; } = string.Empty;
        public decimal EstimatedCost { get; set; }
        public int EstimatedDays { get; set; }
        public string Status { get; set; } = string.Empty; // Draft, Submitted, UnderReview, Approved, Rejected, Completed
        public int? ReviewedByUserId { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
        public string? ApprovedBudget { get; set; }
        public int? ApprovedDays { get; set; }
        public DateTime? DueDate { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual Project? Project { get; set; }
        public virtual ClientUser? ClientUser { get; set; }
        public virtual User? ReviewedByUser { get; set; }
        public virtual ICollection<ChangeOrderDocument> Documents { get; set; } = new List<ChangeOrderDocument>();
    }

    /// <summary>
    /// Change order documents
    /// </summary>
    public class ChangeOrderDocument : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int ChangeOrderRequestId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty; // Quote, Drawing, Spec, Photo, Other
        public string UploadedBy { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual ChangeOrderRequest? ChangeOrderRequest { get; set; }
    }

    /// <summary>
    /// Client activity log
    /// </summary>
    public class ClientActivityLog : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? ClientUserId { get; set; }
        public int? ProjectId { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? Metadata { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual ClientUser? ClientUser { get; set; }
        public virtual Project? Project { get; set; }
    }
}
