using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs
{
    #region Client Portal Settings

    public class ClientPortalSettingsDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
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
    }

    public class UpdateClientPortalSettingsRequest
    {
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
    }

    #endregion

    #region Client User

    public class ClientUserDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? JobTitle { get; set; }
        public bool IsActive { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<string>? ProjectNames { get; set; }
    }

    public class CreateClientUserRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [StringLength(20, MinimumLength = 8)]
        public string Password { get; set; } = string.Empty;

        [Phone]
        public string Phone { get; set; } = string.Empty;

        [Required]
        public string CompanyName { get; set; } = string.Empty;

        public string? JobTitle { get; set; }

        public List<int>? ProjectIds { get; set; }
    }

    public class UpdateClientUserRequest
    {
        [Required]
        public int Id { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        [Phone]
        public string? Phone { get; set; }

        public string? CompanyName { get; set; }
        public string? JobTitle { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ClientLoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class ClientLoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public ClientUserDto ClientUser { get; set; } = new();
        public DateTime ExpiresAt { get; set; }
    }

    public class ChangeClientPasswordRequest
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class ResetClientPasswordRequest
    {
        [Required]
        public string Email { get; set; } = string.Empty;
    }

    public class SetClientPasswordRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    #endregion

    #region Client Project Access

    public class ClientProjectAccessDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int ClientUserId { get; set; }
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public bool CanViewProgress { get; set; }
        public bool CanViewDocuments { get; set; }
        public bool CanViewPayments { get; set; }
        public bool CanSendMessages { get; set; }
        public bool CanRequestChanges { get; set; }
        public DateTime? GrantedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    public class GrantClientProjectAccessRequest
    {
        [Required]
        public int ClientUserId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        public bool CanViewProgress { get; set; } = true;
        public bool CanViewDocuments { get; set; } = true;
        public bool CanViewPayments { get; set; } = true;
        public bool CanSendMessages { get; set; } = true;
        public bool CanRequestChanges { get; set; } = true;

        public DateTime? ExpiresAt { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateClientProjectAccessRequest
    {
        [Required]
        public int Id { get; set; }

        public bool? CanViewProgress { get; set; }
        public bool? CanViewDocuments { get; set; }
        public bool? CanViewPayments { get; set; }
        public bool? CanSendMessages { get; set; }
        public bool? CanRequestChanges { get; set; }

        public DateTime? ExpiresAt { get; set; }
        public string? Notes { get; set; }
    }

    #endregion

    #region Client Dashboard

    public class ClientDashboardDto
    {
        public ClientUserDto? ClientUser { get; set; }
        public List<ClientProjectSummaryDto> Projects { get; set; } = new();
        public ClientPaymentSummaryDto PaymentSummary { get; set; } = new();
        public List<ClientMessageDto> RecentMessages { get; set; } = new();
        public int UnreadMessagesCount { get; set; }
        public int PendingChangeOrdersCount { get; set; }
        public List<ClientActivityDto>? RecentActivities { get; set; }
    }

    public class ClientProjectSummaryDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal ProgressPercentage { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? Location { get; set; }
        public bool HasUpdates { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
    }

    public class ClientPaymentSummaryDto
    {
        public decimal TotalInvoiced { get; set; }
        public decimal TotalPaid { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal OverdueAmount { get; set; }
        public int PendingInvoicesCount { get; set; }
        public int OverdueInvoicesCount { get; set; }
        public List<ClientPaymentDto>? RecentPayments { get; set; }
    }

    #endregion

    #region Client Payments

    public class ClientPaymentDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string InvoiceNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal? PaidAmount { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime InvoiceDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? PaidDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? PaymentMethod { get; set; }
    }

    #endregion

    #region Client Messages

    public class ClientMessageDto
    {
        public int Id { get; set; }
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string MessageType { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? AssignedToName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public int AttachmentsCount { get; set; }
        public int RepliesCount { get; set; }
        public bool IsUnread { get; set; }
    }

    public class CreateClientMessageRequest
    {
        public int? ProjectId { get; set; }

        [Required]
        [StringLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public string MessageType { get; set; } = string.Empty; // Question, Issue, Request, General

        public string Priority { get; set; } = "Medium"; // Low, Medium, High, Urgent

        public List<IFormFile>? Attachments { get; set; }
    }

    public class MessageReplyDto
    {
        public int Id { get; set; }
        public int MessageId { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsInternal { get; set; }
        public string? SenderName { get; set; }
        public string SenderType { get; set; } = string.Empty; // Client, Staff
        public DateTime CreatedAt { get; set; }
        public List<MessageAttachmentDto>? Attachments { get; set; }
    }

    public class CreateMessageReplyRequest
    {
        [Required]
        public int MessageId { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        public bool IsInternal { get; set; }

        public List<IFormFile>? Attachments { get; set; }
    }

    public class MessageAttachmentDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    #endregion

    #region Change Order Requests

    public class ChangeOrderRequestDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string RequestNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public decimal EstimatedCost { get; set; }
        public int EstimatedDays { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ReviewerName { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
        public decimal? ApprovedBudget { get; set; }
        public int? ApprovedDays { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public List<ChangeOrderDocumentDto>? Documents { get; set; }
    }

    public class CreateChangeOrderRequestRequest
    {
        [Required]
        public int ProjectId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty; // Design, Material, Schedule, Scope, Other

        public string Priority { get; set; } = "Medium";

        [Range(0, double.MaxValue)]
        public decimal EstimatedCost { get; set; }

        [Range(0, 365)]
        public int EstimatedDays { get; set; }

        public List<IFormFile>? Documents { get; set; }
    }

    public class UpdateChangeOrderRequestRequest
    {
        [Required]
        public int Id { get; set; }

        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public string? Priority { get; set; }
        public decimal? EstimatedCost { get; set; }
        public int? EstimatedDays { get; set; }
    }

    public class ChangeOrderDocumentDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }

    #endregion

    #region Client Activity

    public class ClientActivityDto
    {
        public int Id { get; set; }
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    #endregion

    #region Client Project Progress

    public class ClientProjectProgressDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal OverallProgress { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public List<PhaseProgressDto> Phases { get; set; } = new();
        public List<RecentUpdateDto> RecentUpdates { get; set; } = new();
        public List<UpcomingMilestoneDto> UpcomingMilestones { get; set; } = new();
    }

    public class PhaseProgressDto
    {
        public int PhaseId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public decimal Progress { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class RecentUpdateDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // Photo, Note, Milestone, Document
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? MediaUrl { get; set; }
    }

    public class UpcomingMilestoneDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    #endregion
}
