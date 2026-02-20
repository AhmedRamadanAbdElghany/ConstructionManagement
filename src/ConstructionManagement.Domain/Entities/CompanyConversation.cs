using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a conversation between a user and a company.
/// Users can only send one initial message until the company owner approves the conversation.
/// </summary>
public class CompanyConversation : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Company? Company { get; set; }
    
    /// <summary>
    /// The user who initiated the conversation
    /// </summary>
    public int InitiatorUserId { get; set; }
    [ForeignKey(nameof(InitiatorUserId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual User InitiatorUser { get; set; } = null!;
    
    /// <summary>
    /// Status: Pending, Approved, Blocked
    /// - Pending: User sent initial message, waiting for company approval
    /// - Approved: Company approved, user can send unlimited messages
    /// - Blocked: Company blocked this user from messaging
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
