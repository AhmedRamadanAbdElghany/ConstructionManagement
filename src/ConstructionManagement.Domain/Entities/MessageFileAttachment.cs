using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a file attachment on a company message.
/// </summary>
public class MessageFileAttachment : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Company? Company { get; set; }
    
    /// <summary>
    /// The message this attachment belongs to
    /// </summary>
    public int MessageId { get; set; }
    [ForeignKey(nameof(MessageId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual CompanyMessage Message { get; set; } = null!;
    
    /// <summary>
    /// Generated file name (GUID-based for storage)
    /// </summary>
    public string FileName { get; set; } = string.Empty;
    
    /// <summary>
    /// Original file name from the user
    /// </summary>
    public string OriginalFileName { get; set; } = string.Empty;
    
    /// <summary>
    /// Full path to the file in storage
    /// </summary>
    public string FilePath { get; set; } = string.Empty;
    
    /// <summary>
    /// MIME type of the file
    /// </summary>
    public string FileType { get; set; } = string.Empty;
    
    /// <summary>
    /// File size in bytes
    /// </summary>
    public long FileSize { get; set; }
    
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
