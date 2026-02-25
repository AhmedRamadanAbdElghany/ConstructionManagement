using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a conversation between a user and a company.
/// Supports bidirectional messaging:
/// - User → Company: User initiates, company approves
/// - Company → User: Company initiates (for clients/workers), auto-approved
/// </summary>
public class CompanyConversation : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Company? Company { get; set; }
    
    /// <summary>
    /// The user who initiated the conversation (always the sender of the first message)
    /// </summary>
    public int InitiatorUserId { get; set; }
    [ForeignKey(nameof(InitiatorUserId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual User InitiatorUser { get; set; } = null!;

    /// <summary>
    /// Optional target user for 1-on-1 messaging (e.g. Worker to Worker)
    /// If null, the conversation is with the Company as a whole.
    /// </summary>
    public int? TargetUserId { get; set; }
    [ForeignKey(nameof(TargetUserId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual User? TargetUser { get; set; }
    
    /// <summary>
    /// Indicates who initiated the conversation:
    /// - "User": A client or worker initiated contact with a company
    /// - "Company": The company initiated contact with a user
    /// - "Worker": Internal worker-to-worker messaging
    /// </summary>
    public string InitiatedBy { get; set; } = "User";
    
    /// <summary>
    /// Status: Pending, Approved, Blocked
    /// - Pending: User sent initial message, waiting for company approval
    /// - Approved: Company approved (or company initiated), both can send messages
    /// - Blocked: Conversation blocked
    /// </summary>
    public string Status { get; set; } = "Pending";
    
    /// <summary>
    /// When the company approved this conversation
    /// </summary>
    public DateTime? ApprovedAt { get; set; }
    
    /// <summary>
    /// Which company admin approved the conversation
    /// </summary>
    public int? ApprovedByUserId { get; set; }
    [ForeignKey(nameof(ApprovedByUserId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual User? ApprovedByUser { get; set; }
    
    /// <summary>
    /// When the conversation was blocked
    /// </summary>
    public DateTime? BlockedAt { get; set; }
    
    /// <summary>
    /// Reason for blocking the conversation
    /// </summary>
    public string? BlockReason { get; set; }
    
    /// <summary>
    /// Timestamp of the last message in this conversation
    /// </summary>
    public DateTime? LastMessageAt { get; set; }
    
    /// <summary>
    /// Reference to the last message for quick preview
    /// </summary>
    public int? LastMessageId { get; set; }
    [ForeignKey(nameof(LastMessageId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual CompanyMessage? LastMessage { get; set; }
    
    public virtual ICollection<CompanyMessage> Messages { get; set; } = new List<CompanyMessage>();
}
