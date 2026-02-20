using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a message in a company conversation.
/// Messages can be sent by either the conversation initiator (user) or company representatives.
/// </summary>
public class CompanyMessage : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Company? Company { get; set; }
    
    /// <summary>
    /// The conversation this message belongs to
    /// </summary>
    public int ConversationId { get; set; }
    [ForeignKey(nameof(ConversationId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual CompanyConversation Conversation { get; set; } = null!;
    
    /// <summary>
    /// The user who sent this message
    /// </summary>
    public int SenderUserId { get; set; }
    [ForeignKey(nameof(SenderUserId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual User SenderUser { get; set; } = null!;
    
    /// <summary>
    /// The message content (text)
    /// </summary>
    public string Content { get; set; } = string.Empty;
    
    /// <summary>
    /// True if sent by company owner/admin, false if sent by conversation initiator
    /// </summary>
    public bool IsFromCompany { get; set; }
    
    /// <summary>
    /// Whether the message has been read by the recipient
    /// </summary>
    public bool IsRead { get; set; }
    
    /// <summary>
    /// When the message was read
    /// </summary>
    public DateTime? ReadAt { get; set; }
    
    /// <summary>
    /// File attachments for this message
    /// </summary>
    public virtual ICollection<MessageFileAttachment> Attachments { get; set; } = new List<MessageFileAttachment>();
}
