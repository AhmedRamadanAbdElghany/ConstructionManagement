namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// DTO for warehouse join request
/// </summary>
public class WarehouseJoinRequestDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? RoleId { get; set; }
    public string? RoleName { get; set; }
    public string? Message { get; set; }
    public string? RejectionReason { get; set; }
    public int? ReviewedByUserId { get; set; }
    public string? ReviewedByFullName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Request to create a join request
/// </summary>
public class CreateWarehouseJoinRequestDto
{
    public int CompanyId { get; set; }
    public string? Message { get; set; }
}

/// <summary>
/// Request to approve/reject a join request
/// </summary>
public class ReviewWarehouseJoinRequestDto
{
    public bool Approve { get; set; }
    public int? RoleId { get; set; }
    public string? RejectionReason { get; set; }
}
