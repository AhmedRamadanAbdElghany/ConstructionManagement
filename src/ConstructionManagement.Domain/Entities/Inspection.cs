using System;
using System.Collections.Generic;

namespace ConstructionManagement.Domain.Entities
{
    #region Enums

    /// <summary>
    /// Status of an inspection request
    /// </summary>
    public enum InspectionStatus
    {
        Pending = 1,           // Created, waiting for company review
        Quoted = 2,            // Company sent quote, waiting for client
        Approved = 3,          // Client approved quote
        Rejected = 4,          // Client rejected quote
        ReadyForInspection = 5, // Scheduled and ready
        InProgress = 6,        // Inspection currently happening
        Completed = 7,         // Inspection finished
        Cancelled = 8          // Cancelled by either party
    }

    /// <summary>
    /// Type of property being inspected
    /// </summary>
    public enum PropertyType
    {
        Villa = 1,
        Apartment = 2,
        House = 3,
        Land = 4,
        Commercial = 5,
        Office = 6,
        Warehouse = 7,
        Other = 99
    }

    /// <summary>
    /// Status of a quote
    /// </summary>
    public enum QuoteStatus
    {
        Pending = 1,
        Accepted = 2,
        Rejected = 3,
        Expired = 4
    }

    /// <summary>
    /// How an inspection session was started
    /// </summary>
    public enum InspectionStartMethod
    {
        QRCode = 1,           // Client scans QR from company
        ApprovalRequest = 2   // Company requests, client approves
    }

    /// <summary>
    /// Type of inspection document
    /// </summary>
    public enum InspectionDocumentType
    {
        Photo = 1,
        Video = 2,
        Document = 3,
        Audio = 4,
        Other = 5
    }

    /// <summary>
    /// Status of inspection payment
    /// </summary>
    public enum InspectionPaymentStatus
    {
        Pending = 1,
        Completed = 2,
        Failed = 3,
        Refunded = 4
    }

    /// <summary>
    /// Status of work request
    /// </summary>
    public enum WorkRequestStatus
    {
        Pending = 1,
        Accepted = 2,
        Rejected = 3,
        Converted = 4
    }

    /// <summary>
    /// Who proposed a time slot
    /// </summary>
    public enum ProposedBy
    {
        Client = 1,
        Company = 2
    }

    /// <summary>
    /// Status of a reschedule request
    /// </summary>
    public enum RescheduleStatus
    {
        Pending = 1,
        Accepted = 2,
        Rejected = 3
    }

    #endregion

    #region Main Entities

    /// <summary>
    /// Main inspection request entity
    /// </summary>
    public class InspectionRequest : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int ClientUserId { get; set; }
        public User ClientUser { get; set; } = null!;

        public PropertyType PropertyType { get; set; }
        public string? PropertyTypeName { get; set; } // Custom name if Other

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public decimal ApproximateArea { get; set; } // Square meters
        public string Address { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        public InspectionStatus Status { get; set; } = InspectionStatus.Pending;

        public decimal? InspectionFee { get; set; }
        public string? Currency { get; set; }

        public DateTime? ScheduledDate { get; set; }
        public TimeSpan? ScheduledTimeStart { get; set; }
        public TimeSpan? ScheduledTimeEnd { get; set; }

        public DateTime? ActualStartTime { get; set; }
        public DateTime? ActualEndTime { get; set; }

        public string? Notes { get; set; }
        public string? CancellationReason { get; set; }
        public int? CancelledByUserId { get; set; }
        public User? CancelledByUser { get; set; }

        // Navigation properties
        public ICollection<InspectionTimeSlot> TimeSlots { get; set; } = new List<InspectionTimeSlot>();
        public ICollection<InspectionQuote> Quotes { get; set; } = new List<InspectionQuote>();
        public InspectionSession? Session { get; set; }
        public ICollection<InspectionDocument> Documents { get; set; } = new List<InspectionDocument>();
        public InspectionPayment? Payment { get; set; }
        public InspectionWorkRequest? WorkRequest { get; set; }
        public InspectionReview? Review { get; set; }
        public InspectionCostEstimate? CostEstimate { get; set; }
        public ICollection<InspectionChatMessage> ChatMessages { get; set; } = new List<InspectionChatMessage>();
        public ICollection<InspectionRescheduleRequest> RescheduleRequests { get; set; } = new List<InspectionRescheduleRequest>();
        public ICollection<InspectionChecklistResponse> ChecklistResponses { get; set; } = new List<InspectionChecklistResponse>();
        public ICollection<InspectionCustomFieldValue> CustomFieldValues { get; set; } = new List<InspectionCustomFieldValue>();
        public ICollection<InspectionTeamMember> TeamMembers { get; set; } = new List<InspectionTeamMember>();
        public InspectionReport? Report { get; set; }
        public ICollection<InspectionSignature> Signatures { get; set; } = new List<InspectionSignature>();
        public ICollection<InspectionAudioNote> AudioNotes { get; set; } = new List<InspectionAudioNote>();
    }

    /// <summary>
    /// Available time slots for inspection
    /// </summary>
    public class InspectionTimeSlot : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public ProposedBy ProposedBy { get; set; }
        public int? ProposedByUserId { get; set; }
        public User? ProposedByUser { get; set; }

        public DateTime Date { get; set; }
        public TimeSpan TimeStart { get; set; }
        public TimeSpan TimeEnd { get; set; }

        public bool IsSelected { get; set; }
        public bool IsAvailable { get; set; } = true;
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Quote from company for inspection
    /// </summary>
    public class InspectionQuote : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public int CompanyUserId { get; set; }
        public User CompanyUser { get; set; } = null!;

        public decimal InspectionFee { get; set; }
        public string Currency { get; set; } = "USD";

        public DateTime ValidUntil { get; set; }
        public string? Terms { get; set; }

        public QuoteStatus Status { get; set; } = QuoteStatus.Pending;

        public DateTime? RespondedAt { get; set; }
        public int? RespondedByUserId { get; set; }
        public User? RespondedByUser { get; set; }
        public string? RejectionReason { get; set; }
    }

    /// <summary>
    /// Active inspection session tracking
    /// </summary>
    public class InspectionSession : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public string VerificationCode { get; set; } = string.Empty; // QR code
        public DateTime? CodeGeneratedAt { get; set; }
        public DateTime? CodeExpiresAt { get; set; }

        public DateTime? StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }

        public InspectionStartMethod StartMethod { get; set; }
        public bool StartVerifiedByClient { get; set; }

        public int CompanyUserId { get; set; }
        public User CompanyUser { get; set; } = null!;

        public bool ClientLocationVerified { get; set; }
        public decimal? ClientLatitude { get; set; }
        public decimal? ClientLongitude { get; set; }

        public string? SessionNotes { get; set; }
    }

    /// <summary>
    /// Documents attached to inspection
    /// </summary>
    public class InspectionDocument : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public InspectionDocumentType Type { get; set; }

        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string MimeType { get; set; } = string.Empty;

        public string? Description { get; set; }
        public int DisplayOrder { get; set; }

        public int UploadedByUserId { get; set; }
        public User UploadedByUser { get; set; } = null!;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Payment for inspection fee
    /// </summary>
    public class InspectionPayment : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";

        public string PaymentMethod { get; set; } = string.Empty; // Online, Cash
        public string? TransactionReference { get; set; }
        public string? PaymentGateway { get; set; } // Stripe, PayPal, etc.

        public InspectionPaymentStatus Status { get; set; } = InspectionPaymentStatus.Pending;

        public DateTime? PaidAt { get; set; }
        public int PaidByUserId { get; set; }
        public User PaidByUser { get; set; } = null!;

        public int? ConfirmedByUserId { get; set; }
        public User? ConfirmedByUser { get; set; }
        public DateTime? ConfirmedAt { get; set; }
    }

    /// <summary>
    /// Client request to start work based on inspection
    /// </summary>
    public class InspectionWorkRequest : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public int ClientUserId { get; set; }
        public User ClientUser { get; set; } = null!;

        public WorkRequestStatus Status { get; set; } = WorkRequestStatus.Pending;

        public string? Message { get; set; }
        public string? CompanyResponse { get; set; }

        public DateTime? RespondedAt { get; set; }
        public int? RespondedByUserId { get; set; }
        public User? RespondedByUser { get; set; }

        public int? ConvertedToProjectId { get; set; }
        public Project? ConvertedToProject { get; set; }
    }

    #endregion

    #region Additional Features

    /// <summary>
    /// Client review of inspection service
    /// </summary>
    public class InspectionReview : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public int ClientUserId { get; set; }
        public User ClientUser { get; set; } = null!;

        public int Rating { get; set; } // 1-5 stars
        public string? Comment { get; set; }

        public bool IsPublic { get; set; } = true;

        public int? CompanyResponseUserId { get; set; }
        public User? CompanyResponseUser { get; set; }
        public string? CompanyResponse { get; set; }
        public DateTime? CompanyRespondedAt { get; set; }
    }

    /// <summary>
    /// Detailed cost estimate for the work
    /// </summary>
    public class InspectionCostEstimate : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public decimal TotalEstimatedCost { get; set; }
        public string Currency { get; set; } = "USD";

        public string? Summary { get; set; }
        public string? Terms { get; set; }

        public int CreatedByUserId { get; set; }
        public User CreatedByUser { get; set; } = null!;

        public DateTime? ValidUntil { get; set; }

        public ICollection<CostEstimateItem> Items { get; set; } = new List<CostEstimateItem>();
    }

    /// <summary>
    /// Individual line item in cost estimate
    /// </summary>
    public class CostEstimateItem : BaseEntity
    {
        public int InspectionCostEstimateId { get; set; }
        public InspectionCostEstimate CostEstimate { get; set; } = null!;

        public string Category { get; set; } = string.Empty; // Materials, Labor, Equipment, etc.
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = string.Empty; // m2, m3, piece, hour, etc.
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string? Notes { get; set; }

        public int DisplayOrder { get; set; }
    }

    /// <summary>
    /// Reschedule request
    /// </summary>
    public class InspectionRescheduleRequest : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public int RequestedByUserId { get; set; }
        public User RequestedByUser { get; set; } = null!;

        public DateTime ProposedDate { get; set; }
        public TimeSpan ProposedTimeStart { get; set; }
        public TimeSpan ProposedTimeEnd { get; set; }

        public string? Reason { get; set; }

        public RescheduleStatus Status { get; set; } = RescheduleStatus.Pending;

        public DateTime? RespondedAt { get; set; }
        public int? RespondedByUserId { get; set; }
        public User? RespondedByUser { get; set; }
        public string? ResponseNotes { get; set; }
    }

    /// <summary>
    /// Chat message for inspection communication
    /// </summary>
    public class InspectionChatMessage : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public int SenderUserId { get; set; }
        public User SenderUser { get; set; } = null!;

        public string Message { get; set; } = string.Empty;
        public string? AttachmentPath { get; set; }
        public string? AttachmentName { get; set; }

        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
    }

    /// <summary>
    /// Inspection checklist template
    /// </summary>
    public class InspectionChecklistTemplate : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public PropertyType? PropertyType { get; set; } // Null = applies to all
        public bool IsActive { get; set; } = true;

        public int CreatedByUserId { get; set; }
        public User CreatedByUser { get; set; } = null!;

        public ICollection<InspectionChecklistItem> Items { get; set; } = new List<InspectionChecklistItem>();
    }

    /// <summary>
    /// Individual checklist item
    /// </summary>
    public class InspectionChecklistItem : BaseEntity
    {
        public int InspectionChecklistTemplateId { get; set; }
        public InspectionChecklistTemplate Template { get; set; } = null!;

        public string Question { get; set; } = string.Empty;
        public string? Description { get; set; }

        public string ResponseType { get; set; } = "Boolean"; // Boolean, Text, Number, Photo
        public bool IsRequired { get; set; }

        public int DisplayOrder { get; set; }
        public string? Options { get; set; } // JSON for select options
    }

    /// <summary>
    /// Response to checklist item during inspection
    /// </summary>
    public class InspectionChecklistResponse : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public int ChecklistItemId { get; set; }
        public InspectionChecklistItem ChecklistItem { get; set; } = null!;

        public string? ResponseValue { get; set; }
        public string? Notes { get; set; }
        public string? PhotoPath { get; set; }

        public int RespondedByUserId { get; set; }
        public User RespondedByUser { get; set; } = null!;

        public DateTime RespondedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Custom field definition for inspections
    /// </summary>
    public class InspectionCustomField : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public string FieldType { get; set; } = "Text"; // Text, Number, Date, Select, MultiSelect
        public bool IsRequired { get; set; }
        public string? DefaultValue { get; set; }
        public string? Options { get; set; } // JSON for select options

        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// Value for custom field
    /// </summary>
    public class InspectionCustomFieldValue : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public int CustomFieldId { get; set; }
        public InspectionCustomField CustomField { get; set; } = null!;

        public string? Value { get; set; }
    }

    /// <summary>
    /// Team member assigned to inspection
    /// </summary>
    public class InspectionTeamMember : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string Role { get; set; } = "Inspector"; // Lead, Inspector, Assistant
        public bool IsPrimary { get; set; }

        public int AssignedByUserId { get; set; }
        public User AssignedByUser { get; set; } = null!;

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Generated inspection report
    /// </summary>
    public class InspectionReport : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public string ReportNumber { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;

        public int GeneratedByUserId { get; set; }
        public User GeneratedByUser { get; set; } = null!;

        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

        public bool IsSentToClient { get; set; }
        public DateTime? SentToClientAt { get; set; }
    }

    /// <summary>
    /// Digital signature for inspection
    /// </summary>
    public class InspectionSignature : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string SignatureData { get; set; } = string.Empty; // Base64 image
        public string SignerName { get; set; } = string.Empty;
        public string SignerRole { get; set; } = string.Empty; // Client, Inspector

        public DateTime SignedAt { get; set; } = DateTime.UtcNow;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }

    /// <summary>
    /// Audio note from inspection
    /// </summary>
    public class InspectionAudioNote : BaseEntity
    {
        public int InspectionRequestId { get; set; }
        public InspectionRequest InspectionRequest { get; set; } = null!;

        public string FilePath { get; set; } = string.Empty;
        public int DurationSeconds { get; set; }
        public string? Transcription { get; set; }

        public int RecordedByUserId { get; set; }
        public User RecordedByUser { get; set; } = null!;

        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Recurring inspection schedule
    /// </summary>
    public class RecurringInspectionSchedule : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int? OriginalInspectionId { get; set; }
        public InspectionRequest? OriginalInspection { get; set; }

        public string Frequency { get; set; } = "Monthly"; // Weekly, Monthly, Quarterly, Yearly
        public int Interval { get; set; } = 1; // Every X weeks/months/etc.

        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? MaxOccurrences { get; set; }

        public bool IsActive { get; set; } = true;
        public int NextOccurrenceNumber { get; set; } = 1;

        public int CreatedByUserId { get; set; }
        public User CreatedByUser { get; set; } = null!;
    }

    #endregion
}