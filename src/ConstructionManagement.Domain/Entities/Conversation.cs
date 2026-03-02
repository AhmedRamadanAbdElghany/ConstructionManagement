using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a conversation between users or between a user and a company.
/// </summary>
public class Conversation : BaseEntity
{
    /// <summary>
    /// The company involved in this conversation (for company-level conversations)
    /// </summary>
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
    /// Optional target user for 1-on-1 messaging (e.g., SystemAdmin to SystemAdmin)
    /// If null, the conversation is with the Company as a whole.
    /// </summary>
    public int? TargetUserId { get; set; }
    [ForeignKey(nameof(TargetUserId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual User? TargetUser { get; set; }
    
    /// <summary>
    /// Indicates who initiated the conversation:
    /// - "User": A user initiated contact with a company or another user
    /// - "Company": The company initiated contact with a user
    /// </summary>
    public string InitiatedBy { get; set; } = "User";
    
    /// <summary>
    /// Status: Pending, Approved, Blocked
    /// </summary>
    public string Status { get; set; } = "Pending";
    
    /// <summary>
    /// When the conversation was approved
    /// </summary>
    public DateTime? ApprovedAt { get; set; }
    
    /// <summary>
    /// Which user approved the conversation
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
    public virtual Message? LastMessage { get; set; }
    
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}
