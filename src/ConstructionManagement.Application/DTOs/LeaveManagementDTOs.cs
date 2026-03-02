using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs
{
    #region Leave Type DTOs
    
    public class LeaveTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DefaultDaysPerYear { get; set; }
        public int DefaultDays { get; set; } // Compatibility for HRService
        public bool AllowCarryOver { get; set; }
        public int MaxCarryOverDays { get; set; }
        public bool RequiresApproval { get; set; }
        public bool IsPaid { get; set; }
        public string ColorCode { get; set; } = "#6366f1";
        public bool IsActive { get; set; }
        public int? CompanyId { get; set; }
    }
    
    public class CreateLeaveTypeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DefaultDaysPerYear { get; set; }
        public bool AllowCarryOver { get; set; }
        public int MaxCarryOverDays { get; set; }
        public bool RequiresApproval { get; set; } = true;
        public bool IsPaid { get; set; } = true;
        public string ColorCode { get; set; } = "#6366f1";
    }
    
    public class UpdateLeaveTypeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DefaultDaysPerYear { get; set; }
        public bool AllowCarryOver { get; set; }
        public int MaxCarryOverDays { get; set; }
        public bool RequiresApproval { get; set; }
        public bool IsPaid { get; set; }
        public string ColorCode { get; set; } = "#6366f1";
        public bool IsActive { get; set; }
    }
    
    #endregion
    
    #region Leave Balance DTOs
    
    public class LeaveBalanceDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int LeaveTypeId { get; set; }
        public string LeaveTypeName { get; set; } = string.Empty;
        public string LeaveTypeColor { get; set; } = "#6366f1";
        public int Year { get; set; }
        public decimal TotalAllocated { get; set; }
        public decimal CarriedOver { get; set; }
        public decimal UsedDays { get; set; }
        public decimal PendingDays { get; set; }
        public decimal AvailableDays { get; set; }
    }
    
    public class UserLeaveSummaryDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public List<LeaveBalanceDto> Balances { get; set; } = new();
        public List<UpcomingLeaveDto> UpcomingLeaves { get; set; } = new();
    }
    
    public class UpcomingLeaveDto
    {
        public int Id { get; set; }
        public string LeaveTypeName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalDays { get; set; }
        public string Status { get; set; } = string.Empty;
    }
    
    public class AdjustLeaveBalanceRequest
    {
        public int UserId { get; set; }
        public int LeaveTypeId { get; set; }
        public int Year { get; set; }
        public decimal Adjustment { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
    
    #endregion
    
    #region Leave Request DTOs
    
    public class LeaveRequestDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatar { get; set; }
        public int LeaveTypeId { get; set; }
        public string LeaveTypeName { get; set; } = string.Empty;
        public string LeaveTypeColor { get; set; } = "#6366f1";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalDays { get; set; }
        public string? Reason { get; set; }
        public string Status { get; set; } = "Pending";
        public string? UserFullName { get; set; } // Compatibility for HRService
        public string? ApprovedByFullName { get; set; } // Compatibility for HRService
        public DateTime? ActionDate { get; set; } // Compatibility for HRService
        public int? ApprovedByUserId { get; set; }
        public string? ApprovedByName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? RejectionReason { get; set; }
        public string? ApproverComments { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<LeaveRequestAttachmentDto> Attachments { get; set; } = new();
    }
    
    // Simplified LeaveRequestDto for HRController compatibility
    public class LeaveRequestDtoHR
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public int LeaveTypeId { get; set; }
        public string LeaveTypeName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Reason { get; set; }
        public LeaveRequestStatus Status { get; set; }
        public int? ApprovedByUserId { get; set; }
        public string? ApprovedByFullName { get; set; }
        public DateTime? ActionDate { get; set; }
        public string? RejectionReason { get; set; }
        public int TotalDays { get; set; }
    }
    
    public class LeaveRequestAttachmentDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string? ContentType { get; set; }
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
    }
    
    public class CreateLeaveRequestRequest
    {
        public int LeaveTypeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Reason { get; set; }
        public List<int>? AttachmentIds { get; set; }
    }
    
    // Simplified CreateLeaveRequest for HRController compatibility
    public class CreateLeaveRequest
    {
        [Required(ErrorMessage = "Leave type is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Leave type must be valid")]
        public int LeaveTypeId { get; set; }
        
        [Required(ErrorMessage = "Start date is required")]
        public DateTime StartDate { get; set; }
        
        [Required(ErrorMessage = "End date is required")]
        public DateTime EndDate { get; set; }
        
        [StringLength(500, ErrorMessage = "Reason cannot exceed 500 characters")]
        public string? Reason { get; set; }
    }
    
    public class UpdateLeaveRequestRequest
    {
        public int LeaveTypeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Reason { get; set; }
    }
    
    public class ApproveLeaveRequestRequest
    {
        public string? Comments { get; set; }
    }
    
    public class RejectLeaveRequestRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
    
    // Simplified ReviewLeaveRequest for HRController compatibility
    public class ReviewLeaveRequest
    {
        [Required(ErrorMessage = "Approval decision is required")]
        public bool Approved { get; set; }
        
        [StringLength(500, ErrorMessage = "Rejection reason cannot exceed 500 characters")]
        public string? RejectionReason { get; set; }
    }
    
    public class LeaveRequestFilter
    {
        public int? UserId { get; set; }
        public int? LeaveTypeId { get; set; }
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? CompanyId { get; set; }
        public List<int>? CompanyIds { get; set; }
    }
    
    #endregion
    
    #region Holiday DTOs
    
    public class HolidayDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public bool IsRecurring { get; set; }
        public int? CompanyId { get; set; }
        public string? Description { get; set; }
    }
    
    public class CreateHolidayRequest
    {
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public bool IsRecurring { get; set; }
        public string? Description { get; set; }
    }
    
    public class UpdateHolidayRequest
    {
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public bool IsRecurring { get; set; }
        public string? Description { get; set; }
    }
    
    #endregion
    
    #region Calendar & Reports
    
    public class LeaveCalendarDto
    {
        public DateTime Date { get; set; }
        public bool IsHoliday { get; set; }
        public string? HolidayName { get; set; }
        public bool IsWeekend { get; set; }
        public List<LeaveCalendarEntryDto> Leaves { get; set; } = new();
    }
    
    public class LeaveCalendarEntryDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string LeaveTypeName { get; set; } = string.Empty;
        public string LeaveTypeColor { get; set; } = "#6366f1";
        public string Status { get; set; } = string.Empty;
    }
    
    public class LeaveReportDto
    {
        public int TotalEmployees { get; set; }
        public int EmployeesOnLeaveToday { get; set; }
        public decimal TotalDaysTakenThisMonth { get; set; }
        public decimal TotalDaysTakenThisYear { get; set; }
        public List<LeaveTypeSummaryDto> LeaveTypeSummaries { get; set; } = new();
        public List<MonthlyLeaveTrendDto> MonthlyTrends { get; set; } = new();
    }
    
    public class LeaveTypeSummaryDto
    {
        public string LeaveTypeName { get; set; } = string.Empty;
        public int TotalRequests { get; set; }
        public int ApprovedRequests { get; set; }
        public int PendingRequests { get; set; }
        public int RejectedRequests { get; set; }
        public decimal TotalDays { get; set; }
    }
    
    public class MonthlyLeaveTrendDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal TotalDays { get; set; }
        public int RequestCount { get; set; }
    }
    
    #endregion
}
