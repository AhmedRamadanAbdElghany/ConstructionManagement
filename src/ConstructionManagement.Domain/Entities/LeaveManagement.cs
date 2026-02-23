using System;
using System.ComponentModel.DataAnnotations;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Defines types of leave available in the system
    /// </summary>
    public class LeaveType : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        /// <summary>
        /// Default number of days allowed per year
        /// </summary>
        public int DefaultDaysPerYear { get; set; }
        
        /// <summary>
        /// Whether unused days can be carried over to next year
        /// </summary>
        public bool AllowCarryOver { get; set; }
        
        /// <summary>
        /// Maximum days that can be carried over
        /// </summary>
        public int MaxCarryOverDays { get; set; }
        
        /// <summary>
        /// Whether this leave type requires approval
        /// </summary>
        public bool RequiresApproval { get; set; } = true;
        
        /// <summary>
        /// Whether this leave type is paid
        /// </summary>
        public bool IsPaid { get; set; } = true;
        
        /// <summary>
        /// Color code for UI display (hex)
        /// </summary>
        [MaxLength(10)]
        public string ColorCode { get; set; } = "#6366f1";
        
        /// <summary>
        /// Whether this leave type is active
        /// </summary>
        public bool IsActive { get; set; } = true;
        
        /// <summary>
        /// Company ID for multi-tenancy (null = system default)
        /// </summary>
        public int? CompanyId { get; set; }
    }
    
    /// <summary>
    /// Tracks leave balance for each user and leave type per year
    /// </summary>
    public class LeaveBalance : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public int LeaveTypeId { get; set; }
        public LeaveType LeaveType { get; set; } = null!;
        
        /// <summary>
        /// Year this balance applies to
        /// </summary>
        public int Year { get; set; }
        
        /// <summary>
        /// Total days allocated for this year
        /// </summary>
        public decimal TotalAllocated { get; set; }
        
        /// <summary>
        /// Days carried over from previous year
        /// </summary>
        public decimal CarriedOver { get; set; }
        
        /// <summary>
        /// Days used so far
        /// </summary>
        public decimal UsedDays { get; set; }
        
        /// <summary>
        /// Days pending approval
        /// </summary>
        public decimal PendingDays { get; set; }
        
        /// <summary>
        /// Calculated available days (TotalAllocated + CarriedOver - UsedDays - PendingDays)
        /// </summary>
        public decimal AvailableDays => TotalAllocated + CarriedOver - UsedDays - PendingDays;
    }
    
    /// <summary>
    /// Leave request submitted by an employee
    /// </summary>
    public class LeaveRequest : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public int LeaveTypeId { get; set; }
        public LeaveType LeaveType { get; set; } = null!;
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        /// <summary>
        /// Total days requested (calculated, excluding weekends/holidays if configured)
        /// </summary>
        public decimal TotalDays { get; set; }
        
        /// <summary>
        /// Reason for the leave request
        /// </summary>
        [MaxLength(1000)]
        public string? Reason { get; set; }
        
        /// <summary>
        /// Current status of the request
        /// </summary>
        public LeaveRequestStatus Status { get; set; } = LeaveRequestStatus.Pending;
        
        /// <summary>
        /// User who approved/rejected the request
        /// </summary>
        public int? ApprovedByUserId { get; set; }
        public User? ApprovedBy { get; set; }
        
        /// <summary>
        /// Date when the request was approved/rejected
        /// </summary>
        public DateTime? ApprovedAt { get; set; }
        
        /// <summary>
        /// Reason for rejection (if rejected)
        /// </summary>
        [MaxLength(500)]
        public string? RejectionReason { get; set; }
        
        /// <summary>
        /// Comments from approver
        /// </summary>
        [MaxLength(500)]
        public string? ApproverComments { get; set; }
        
        /// <summary>
        /// Whether the user was notified of the decision
        /// </summary>
        public bool UserNotified { get; set; }
        
        /// <summary>
        /// Attachments (medical certificates, etc.)
        /// </summary>
        public ICollection<LeaveRequestAttachment> Attachments { get; set; } = new List<LeaveRequestAttachment>();
    }
    
    /// <summary>
    /// Attachments for leave requests (medical certificates, etc.)
    /// </summary>
    public class LeaveRequestAttachment : BaseEntity
    {
        public int LeaveRequestId { get; set; }
        public LeaveRequest LeaveRequest { get; set; } = null!;
        
        [Required]
        [MaxLength(500)]
        public string FileName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(1000)]
        public string FilePath { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? ContentType { get; set; }
        
        public long FileSize { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Holiday definition for leave calculations
    /// </summary>
    public class Holiday : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public DateTime Date { get; set; }
        
        /// <summary>
        /// Whether this is a recurring holiday (same date every year)
        /// </summary>
        public bool IsRecurring { get; set; }
        
        /// <summary>
        /// Company ID (null = national holiday for all)
        /// </summary>
        public int? CompanyId { get; set; }
        
        [MaxLength(500)]
        public string? Description { get; set; }
    }
    
    /// <summary>
    /// Leave request status
    /// </summary>
    public enum LeaveRequestStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2,
        Cancelled = 3,
        CancelledByUser = 4
    }
}
