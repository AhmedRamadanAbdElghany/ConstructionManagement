using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a request for leave submitted by an employee.
/// </summary>
public class LeaveRequest : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
    
    public int LeaveTypeId { get; set; }
    [ForeignKey(nameof(LeaveTypeId))]
    public virtual LeaveType LeaveType { get; set; } = null!;
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    public string? Reason { get; set; }
    public LeaveRequestStatus Status { get; set; } = LeaveRequestStatus.Pending;
    
    public int? ApprovedByUserId { get; set; }
    [ForeignKey(nameof(ApprovedByUserId))]
    public virtual User? ApprovedByUser { get; set; }
    
    public DateTime? ActionDate { get; set; }
    public string? RejectionReason { get; set; }
    
    [NotMapped]
    public int TotalDays => (EndDate.Date - StartDate.Date).Days + 1;
}
