using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a message in a conversation.
/// Messages can be sent between users or between a user and a company.
/// </summary>
public class Message : BaseEntity
{
    /// <summary>
    /// The company this message belongs to (for company-level messages)
    /// </summary>
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Company? Company { get; set; }

    /// <summary>
    /// Whether the message was sent by the company (true) or by a user (false)
    /// </summary>
    public bool IsFromCompany { get; set; }

    /// <summary>
    /// The conversation this message belongs to
    /// </summary>
    public int ConversationId { get; set; }
    [ForeignKey(nameof(ConversationId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Conversation Conversation { get; set; } = null!;
    
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
