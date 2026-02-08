using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs
{
    #region Category DTOs

    public class DocumentCategoryDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ParentCategoryId { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public int DocumentCount { get; set; }
    }

    public class CreateCategoryRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ParentCategoryId { get; set; }
        public int SortOrder { get; set; }
    }

    public class UpdateCategoryRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? ParentCategoryId { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsActive { get; set; }
    }

    #endregion

    #region Document DTOs

    public class DocumentDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string? Tags { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
        public long FileSize { get; set; }
        public string FileType { get; set; } = string.Empty;
        public string FileSizeFormatted { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool IsArchived { get; set; }
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool IsExpired { get; set; }
        public int DaysUntilExpiry { get; set; }
        public int CurrentVersion { get; set; }
        public bool RequiresApproval { get; set; }
        public string? ApprovalStatus { get; set; }
        public string UploadedBy { get; set; } = string.Empty;
        public DateTime UploadedDate { get; set; }
        public int DownloadCount { get; set; }
        public int ViewCount { get; set; }
    }

    public class CreateDocumentRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        public string DocumentType { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public int? ProjectId { get; set; }
        public string? Tags { get; set; }
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool RequiresApproval { get; set; } = false;
        public IFormFile? File { get; set; }
    }

    public class UpdateDocumentRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? DocumentType { get; set; }
        public int? CategoryId { get; set; }
        public string? Tags { get; set; }
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool? RequiresApproval { get; set; }
        public IFormFile? File { get; set; }
        public string? ChangeNotes { get; set; }
    }

    public class UploadVersionRequest
    {
        public IFormFile? File { get; set; }
        public string? ChangeNotes { get; set; }
    }

    #endregion

    #region Version DTOs

    public class DocumentVersionDto
    {
        public int Id { get; set; }
        public int DocumentId { get; set; }
        public int VersionNumber { get; set; }
        public string? ChangeNotes { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
        public long FileSize { get; set; }
        public string FileType { get; set; } = string.Empty;
        public string UploadedBy { get; set; } = string.Empty;
        public DateTime UploadedDate { get; set; }
        public bool IsCurrentVersion { get; set; }
    }

    #endregion

    #region Approval DTOs

    public class DocumentApprovalDto
    {
        public int Id { get; set; }
        public int DocumentId { get; set; }
        public string? DocumentTitle { get; set; }
        public int VersionId { get; set; }
        public int ApprovalOrder { get; set; }
        public string ApproverRole { get; set; } = string.Empty;
        public string? ApproverName { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Comments { get; set; }
        public DateTime RequestedDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? ActionDate { get; set; }
    }

    public class SubmitApprovalRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;  // Approved or Rejected
        public string? Comments { get; set; }
    }

    public class RequestApprovalRequest
    {
        public List<string> ApproverRoles { get; set; } = new();
        public DateTime? DueDate { get; set; }
        public string? Notes { get; set; }
    }

    #endregion

    #region Summary DTOs

    public class DocumentSummaryDto
    {
        public int TotalDocuments { get; set; }
        public int TotalCategories { get; set; }
        public int PendingApprovals { get; set; }
        public int ExpiringDocuments { get; set; }
        public int ExpiredDocuments { get; set; }
        public long TotalStorageUsed { get; set; }
        public string StorageUsedFormatted { get; set; } = string.Empty;
        public Dictionary<string, int> DocumentsByType { get; set; } = new();
        public List<DocumentDto> RecentDocuments { get; set; } = new();
        public List<DocumentDto> ExpiringSoon { get; set; } = new();
    }

    public class DocumentSearchRequest
    {
        public string? Query { get; set; }
        public int? CategoryId { get; set; }
        public string? DocumentType { get; set; }
        public int? ProjectId { get; set; }
        public string? Status { get; set; }
        public bool? Expired { get; set; }
        public bool? ExpiringSoon { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "UploadedDate";
        public bool SortDescending { get; set; } = true;
    }

    #endregion
}
