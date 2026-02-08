using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Document metadata and categorization
    /// </summary>
    public class DocumentCategory : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ParentCategoryId { get; set; }  // For hierarchical categories
        public int SortOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
    }

    /// <summary>
    /// Main document entity with metadata
    /// </summary>
    public class Document : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        // Category
        public int? CategoryId { get; set; }
        [ForeignKey(nameof(CategoryId))]
        public virtual DocumentCategory? Category { get; set; }

        // Project reference (optional - documents can be project-specific or company-wide)
        public int? ProjectId { get; set; }
        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }

        // Basic Info
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string DocumentType { get; set; } = string.Empty;  // Contract, Permit, Blueprint, Compliance, Other
        public string? Tags { get; set; }  // Comma-separated tags for search

        // File Info
        public string FileName { get; set; } = string.Empty;
        public string? FilePath { get; set; }
        public string? FileUrl { get; set; }
        public long FileSize { get; set; }
        public string FileType { get; set; } = string.Empty;  // MIME type
        public string? Checksum { get; set; }  // For integrity verification

        // Status
        public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
        public bool IsArchived { get; set; } = false;
        public new bool IsDeleted { get; set; } = false;

        // Expiration
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool? IsExpired { get; set; }
        public int? ExpirationWarningDays { get; set; } = 30;  // Days before expiry to warn

        // Versioning
        public int CurrentVersion { get; set; } = 1;
        public int? LatestVersionId { get; set; }

        // Approval
        public bool RequiresApproval { get; set; } = false;
        public string? ApprovalStatus { get; set; }
        public int? ApprovedByUserId { get; set; }
        public DateTime? ApprovedDate { get; set; }

        // Audit
        public string UploadedBy { get; set; } = string.Empty;
        public DateTime UploadedDate { get; set; } = DateTime.UtcNow;
        public string? LastModifiedBy { get; set; }
        public DateTime? LastModifiedDate { get; set; }
        public int DownloadCount { get; set; } = 0;
        public int ViewCount { get; set; } = 0;

        // Navigation properties
        public virtual ICollection<DocumentVersion> Versions { get; set; } = new List<DocumentVersion>();
        public virtual ICollection<DocumentApproval> Approvals { get; set; } = new List<DocumentApproval>();
    }

    /// <summary>
    /// Document version tracking
    /// </summary>
    public class DocumentVersion : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        // Document reference
        public int DocumentId { get; set; }
        [ForeignKey(nameof(DocumentId))]
        public virtual Document Document { get; set; } = null!;

        // Version Info
        public int VersionNumber { get; set; }
        public string? ChangeNotes { get; set; }

        // File Info
        public string FileName { get; set; } = string.Empty;
        public string? FilePath { get; set; }
        public string? FileUrl { get; set; }
        public long FileSize { get; set; }
        public string FileType { get; set; } = string.Empty;
        public string? Checksum { get; set; }

        // Audit
        public string UploadedBy { get; set; } = string.Empty;
        public DateTime UploadedDate { get; set; } = DateTime.UtcNow;
        public bool IsCurrentVersion { get; set; } = false;
    }

    /// <summary>
    /// Document approval workflow
    /// </summary>
    public class DocumentApproval : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        // Document reference
        public int DocumentId { get; set; }
        [ForeignKey(nameof(DocumentId))]
        public virtual Document Document { get; set; } = null!;

        // Version reference
        public int? VersionId { get; set; }
        [ForeignKey(nameof(VersionId))]
        public virtual DocumentVersion? Version { get; set; }

        // Approval Details
        public int ApprovalOrder { get; set; } = 1;
        public string ApproverRole { get; set; } = string.Empty;
        public int? ApproverUserId { get; set; }
        public string? ApproverName { get; set; }

        public ApprovalStatus Status { get; set; } = ApprovalStatus.Pending;
        public DateTime? StatusDate { get; set; }
        public string? Comments { get; set; }

        // Dates
        public DateTime RequestedDate { get; set; } = DateTime.UtcNow;
        public DateTime? DueDate { get; set; }
        public DateTime? ActionDate { get; set; }

        // Reminder
        public bool ReminderSent { get; set; } = false;
        public DateTime? ReminderDate { get; set; }
    }

    public enum DocumentStatus
    {
        Draft = 0,
        PendingApproval = 1,
        Approved = 2,
        Rejected = 3,
        Archived = 4,
        Expired = 5
    }

    public enum ApprovalStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2,
        Skipped = 3
    }
}
