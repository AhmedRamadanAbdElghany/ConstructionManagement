using System;
using System.Collections.Generic;

namespace ConstructionManagement.Application.DTOs
{
    #region Inspection Request DTOs

    /// <summary>
    /// DTO for creating a new inspection request
    /// </summary>
    public class CreateInspectionRequestDto
    {
        public int? CompanyId { get; set; }
        public int PropertyType { get; set; }
        public string? PropertyTypeName { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal ApproximateArea { get; set; }
        public string Address { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public List<CreateTimeSlotDto>? TimeSlots { get; set; }
        public Dictionary<string, string>? CustomFields { get; set; }
    }

    /// <summary>
    /// DTO for updating an inspection request
    /// </summary>
    public class UpdateInspectionRequestDto
    {
        public int PropertyType { get; set; }
        public string? PropertyTypeName { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal ApproximateArea { get; set; }
        public string Address { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }

    /// <summary>
    /// DTO for inspection request details
    /// </summary>
    public class InspectionRequestDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public int ClientUserId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public int PropertyType { get; set; }
        public string PropertyTypeName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal ApproximateArea { get; set; }
        public string Address { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public decimal? InspectionFee { get; set; }
        public string? Currency { get; set; }
        public DateTime? ScheduledDate { get; set; }
        public TimeSpan? ScheduledTimeStart { get; set; }
        public TimeSpan? ScheduledTimeEnd { get; set; }
        public DateTime? ActualStartTime { get; set; }
        public DateTime? ActualEndTime { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<InspectionTimeSlotDto> TimeSlots { get; set; } = new();
        public List<InspectionQuoteDto> Quotes { get; set; } = new();
        public InspectionSessionDto? Session { get; set; }
        public List<InspectionDocumentDto> Documents { get; set; } = new();
        public InspectionPaymentDto? Payment { get; set; }
        public InspectionWorkRequestDto? WorkRequest { get; set; }
        public InspectionReviewDto? Review { get; set; }
        public InspectionCostEstimateDto? CostEstimate { get; set; }
        public List<InspectionTeamMemberDto> TeamMembers { get; set; } = new();
    }

    /// <summary>
    /// DTO for inspection list item
    /// </summary>
    public class InspectionRequestListDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public int PropertyType { get; set; }
        public string PropertyTypeName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public decimal? InspectionFee { get; set; }
        public DateTime? ScheduledDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Paged result for inspection requests
    /// </summary>
    public class InspectionRequestPagedResultDto
    {
        public List<InspectionRequestListDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    #endregion

    #region Time Slot DTOs

    public class CreateTimeSlotDto
    {
        public DateTime Date { get; set; }
        public TimeSpan TimeStart { get; set; }
        public TimeSpan TimeEnd { get; set; }
        public string? Notes { get; set; }
    }

    public class InspectionTimeSlotDto
    {
        public int Id { get; set; }
        public int ProposedBy { get; set; }
        public string ProposedByName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public TimeSpan TimeStart { get; set; }
        public TimeSpan TimeEnd { get; set; }
        public bool IsSelected { get; set; }
        public bool IsAvailable { get; set; }
        public string? Notes { get; set; }
    }

    #endregion

    #region Quote DTOs

    public class CreateInspectionQuoteDto
    {
        public decimal InspectionFee { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime ValidUntil { get; set; }
        public string? Terms { get; set; }
    }

    public class InspectionQuoteDto
    {
        public int Id { get; set; }
        public int InspectionRequestId { get; set; }
        public int CompanyUserId { get; set; }
        public string CompanyUserName { get; set; } = string.Empty;
        public decimal InspectionFee { get; set; }
        public string Currency { get; set; } = string.Empty;
        public DateTime ValidUntil { get; set; }
        public string? Terms { get; set; }
        public int Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class RespondToQuoteDto
    {
        public bool Accept { get; set; }
        public string? RejectionReason { get; set; }
    }

    #endregion

    #region Session DTOs

    public class InspectionSessionDto
    {
        public int Id { get; set; }
        public string VerificationCode { get; set; } = string.Empty;
        public DateTime? CodeGeneratedAt { get; set; }
        public DateTime? CodeExpiresAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public int StartMethod { get; set; }
        public string StartMethodName { get; set; } = string.Empty;
        public bool StartVerifiedByClient { get; set; }
        public int CompanyUserId { get; set; }
        public string CompanyUserName { get; set; } = string.Empty;
        public bool ClientLocationVerified { get; set; }
        public string? SessionNotes { get; set; }
    }

    public class VerifyInspectionStartDto
    {
        public string VerificationCode { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }

    public class StartInspectionDto
    {
        public int StartMethod { get; set; }
        public string? SessionNotes { get; set; }
    }

    public class QRCodeResponseDto
    {
        public string VerificationCode { get; set; } = string.Empty;
        public string QrCodeUrl { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    #endregion

    #region Document DTOs

    public class InspectionDocumentDto
    {
        public int Id { get; set; }
        public int Type { get; set; }
        public string TypeName { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string MimeType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
        public string UploadedByName { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }

    public class UploadInspectionDocumentDto
    {
        public int Type { get; set; }
        public string? Description { get; set; }
    }

    #endregion

    #region Payment DTOs

    public class InspectionPaymentDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string? TransactionReference { get; set; }
        public int Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public DateTime? PaidAt { get; set; }
        public string PaidByName { get; set; } = string.Empty;
    }

    public class PayInspectionDto
    {
        public string PaymentMethod { get; set; } = string.Empty; // Online, Cash
        public string? PaymentMethodId { get; set; } // For Stripe
    }

    public class ConfirmCashPaymentDto
    {
        public string? Notes { get; set; }
    }

    #endregion

    #region Work Request DTOs

    public class CreateWorkRequestDto
    {
        public string? Message { get; set; }
    }

    public class InspectionWorkRequestDto
    {
        public int Id { get; set; }
        public int InspectionRequestId { get; set; }
        public int ClientUserId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public int Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public string? Message { get; set; }
        public string? CompanyResponse { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
        public int? ConvertedToProjectId { get; set; }
    }

    public class RespondToWorkRequestDto
    {
        public bool Accept { get; set; }
        public string? Response { get; set; }
    }

    #endregion

    #region Review DTOs

    public class CreateInspectionReviewDto
    {
        public int Rating { get; set; } // 1-5
        public string? Comment { get; set; }
        public bool IsPublic { get; set; } = true;
    }

    public class InspectionReviewDto
    {
        public int Id { get; set; }
        public int InspectionRequestId { get; set; }
        public int ClientUserId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CompanyResponse { get; set; }
        public DateTime? CompanyRespondedAt { get; set; }
    }

    #endregion

    #region Cost Estimate DTOs

    public class CreateCostEstimateDto
    {
        public string? Summary { get; set; }
        public string? Terms { get; set; }
        public DateTime? ValidUntil { get; set; }
        public List<CreateCostEstimateItemDto> Items { get; set; } = new();
    }

    public class CreateCostEstimateItemDto
    {
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public string? Notes { get; set; }
    }

    public class InspectionCostEstimateDto
    {
        public int Id { get; set; }
        public int InspectionRequestId { get; set; }
        public decimal TotalEstimatedCost { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public string? Terms { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ValidUntil { get; set; }
        public List<CostEstimateItemDto> Items { get; set; } = new();
    }

    public class CostEstimateItemDto
    {
        public int Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string? Notes { get; set; }
    }

    #endregion

    #region Reschedule DTOs

    public class CreateRescheduleRequestDto
    {
        public DateTime ProposedDate { get; set; }
        public TimeSpan ProposedTimeStart { get; set; }
        public TimeSpan ProposedTimeEnd { get; set; }
        public string? Reason { get; set; }
    }

    public class InspectionRescheduleRequestDto
    {
        public int Id { get; set; }
        public int InspectionRequestId { get; set; }
        public int RequestedByUserId { get; set; }
        public string RequestedByName { get; set; } = string.Empty;
        public DateTime ProposedDate { get; set; }
        public TimeSpan ProposedTimeStart { get; set; }
        public TimeSpan ProposedTimeEnd { get; set; }
        public string? Reason { get; set; }
        public int Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
        public string? ResponseNotes { get; set; }
    }

    public class RespondToRescheduleDto
    {
        public bool Accept { get; set; }
        public string? Notes { get; set; }
    }

    #endregion

    #region Chat DTOs

    public class SendChatMessageDto
    {
        public string Message { get; set; } = string.Empty;
    }

    public class InspectionChatMessageDto
    {
        public int Id { get; set; }
        public int InspectionRequestId { get; set; }
        public int SenderUserId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderRole { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? AttachmentPath { get; set; }
        public string? AttachmentName { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    #endregion

    #region Checklist DTOs

    public class InspectionChecklistTemplateDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? PropertyType { get; set; }
        public bool IsActive { get; set; }
        public List<InspectionChecklistItemDto> Items { get; set; } = new();
    }

    public class InspectionChecklistItemDto
    {
        public int Id { get; set; }
        public string Question { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ResponseType { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class InspectionChecklistResponseDto
    {
        public int Id { get; set; }
        public int ChecklistItemId { get; set; }
        public string Question { get; set; } = string.Empty;
        public string? ResponseValue { get; set; }
        public string? Notes { get; set; }
        public string? PhotoPath { get; set; }
        public DateTime RespondedAt { get; set; }
    }

    public class SubmitChecklistResponseDto
    {
        public int ChecklistItemId { get; set; }
        public string? ResponseValue { get; set; }
        public string? Notes { get; set; }
    }

    #endregion

    #region Team Member DTOs

    public class AssignTeamMemberDto
    {
        public int UserId { get; set; }
        public string Role { get; set; } = "Inspector";
        public bool IsPrimary { get; set; }
    }

    public class InspectionTeamMemberDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
        public DateTime AssignedAt { get; set; }
    }

    #endregion

    #region Signature DTOs

    public class SubmitSignatureDto
    {
        public string SignatureData { get; set; } = string.Empty; // Base64 image
        public string SignerName { get; set; } = string.Empty;
        public string SignerRole { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }

    public class InspectionSignatureDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string SignerName { get; set; } = string.Empty;
        public string SignerRole { get; set; } = string.Empty;
        public DateTime SignedAt { get; set; }
    }

    #endregion

    #region Audio Note DTOs

    public class InspectionAudioNoteDto
    {
        public int Id { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public int DurationSeconds { get; set; }
        public string? Transcription { get; set; }
        public string RecordedByName { get; set; } = string.Empty;
        public DateTime RecordedAt { get; set; }
    }

    #endregion

    #region Report DTOs

    public class InspectionReportDto
    {
        public int Id { get; set; }
        public string ReportNumber { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string GeneratedByName { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public bool IsSentToClient { get; set; }
        public DateTime? SentToClientAt { get; set; }
    }

    public class GenerateReportDto
    {
        public bool SendToClient { get; set; }
    }

    #endregion

    #region Analytics DTOs

    public class InspectionAnalyticsDto
    {
        public int TotalInspections { get; set; }
        public int CompletedInspections { get; set; }
        public int PendingInspections { get; set; }
        public int CancelledInspections { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageFee { get; set; }
        public double CompletionRate { get; set; }
        public double ConversionRate { get; set; } // Inspections converted to projects
        public double AverageRating { get; set; }
        public List<InspectionMonthlyStatsDto> MonthlyStats { get; set; } = new();
    }

    public class InspectionMonthlyStatsDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int Count { get; set; }
        public decimal Revenue { get; set; }
    }

    #endregion

    #region Filter DTOs

    public class InspectionFilterDto
    {
        public int? Status { get; set; }
        public int? PropertyType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? SearchTerm { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    #endregion
}