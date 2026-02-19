using System.ComponentModel.DataAnnotations;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs.HR;

public class LeaveTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DefaultDays { get; set; }
    public bool IsPaid { get; set; }
    public bool RequiresApproval { get; set; }
}

public class LeaveRequestDto
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

public class ReviewLeaveRequest
{
    [Required(ErrorMessage = "Approval decision is required")]
    public bool Approved { get; set; }
    
    [StringLength(500, ErrorMessage = "Rejection reason cannot exceed 500 characters")]
    public string? RejectionReason { get; set; }
}
