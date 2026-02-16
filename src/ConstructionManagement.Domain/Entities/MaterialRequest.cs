using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a request for materials from a project
/// </summary>
public class MaterialRequest : BaseEntity, ICompanyEntity
{
    public string RequestNumber { get; set; } = string.Empty;
    
    /// <summary>
    /// The project requesting materials
    /// </summary>
    public int? ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }
    
    /// <summary>
    /// User who made the request
    /// </summary>
    public int? RequestedByUserId { get; set; }
    [ForeignKey(nameof(RequestedByUserId))]
    public virtual User? RequestedByUser { get; set; }
    
    /// <summary>
    /// User who approved/rejected the request
    /// </summary>
    public int? ApprovedByUserId { get; set; }
    [ForeignKey(nameof(ApprovedByUserId))]
    public virtual User? ApprovedByUser { get; set; }
    
    /// <summary>
    /// Status of the request
    /// </summary>
    public string Status { get; set; } = RequestStatus.Pending.ToString();
    
    /// <summary>
    /// Priority of the request
    /// </summary>
    public string Priority { get; set; } = RequestPriority.Normal.ToString();
    
    /// <summary>
    /// Date when request was made
    /// </summary>
    public DateTime RequestDate { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Date when request is needed
    /// </summary>
    public DateTime? RequiredDate { get; set; }
    
    /// <summary>
    /// Date when request was approved/rejected
    /// </summary>
    public DateTime? ApprovalDate { get; set; }
    
    /// <summary>
    /// Warehouse to fulfill from
    /// </summary>
    public string SourceWarehouse { get; set; } = "main";
    
    /// <summary>
    /// Location on site where materials are needed
    /// </summary>
    public string? DeliveryLocation { get; set; }
    
    /// <summary>
    /// Notes or special instructions
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// Reason for rejection (if rejected)
    /// </summary>
    public string? RejectionReason { get; set; }
    
    /// <summary>
    /// Total estimated cost
    /// </summary>
    public decimal? EstimatedCost { get; set; }
    
    /// <summary>
    /// Actual cost when fulfilled
    /// </summary>
    public decimal? ActualCost { get; set; }
    
    // Navigation Properties
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
    
    public virtual ICollection<MaterialRequestItem> Items { get; set; }
        = new List<MaterialRequestItem>();
}

/// <summary>
/// Request status enum
/// </summary>
public enum RequestStatus
{
    Pending = 0,
    Approved = 1,
    PartiallyFulfilled = 2,
    Fulfilled = 3,
    Rejected = 4,
    Cancelled = 5
}

/// <summary>
/// Request priority enum
/// </summary>
public enum RequestPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}
