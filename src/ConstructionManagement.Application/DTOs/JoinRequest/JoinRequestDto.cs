namespace ConstructionManagement.Application.DTOs.JoinRequest;

public class JoinRequestDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
    public int? ReviewedByUserId { get; set; }
    public string? ReviewedByFullName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Message { get; set; }
}

public class CreateJoinRequestDto
{
    public int CompanyId { get; set; }
    public string? Message { get; set; }
}

public class ApproveJoinRequestDto
{
    public int? ReviewedByUserId { get; set; }
}

public class RejectJoinRequestDto
{
    public string RejectionReason { get; set; } = string.Empty;
    public int? ReviewedByUserId { get; set; }
}
