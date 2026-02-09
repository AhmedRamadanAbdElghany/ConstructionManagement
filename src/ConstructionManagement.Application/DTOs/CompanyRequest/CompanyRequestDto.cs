namespace ConstructionManagement.Application.DTOs.CompanyRequest;

public class CompanyRequestDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? BusinessId { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Address { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
    public int? ReviewedByUserId { get; set; }
    public string? ReviewedByFullName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Notes { get; set; }
}

public class CreateCompanyRequestDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string? BusinessId { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
}

public class ApproveCompanyRequestDto
{
    public int? ReviewedByUserId { get; set; }
    public string? Notes { get; set; }
}

public class RejectCompanyRequestDto
{
    public string RejectionReason { get; set; } = string.Empty;
    public int? ReviewedByUserId { get; set; }
}
