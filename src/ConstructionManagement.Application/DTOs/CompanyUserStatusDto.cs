namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// Request DTO for updating company-user relationship status
/// </summary>
public class UpdateCompanyUserStatusRequest
{
    /// <summary>
    /// New status for the company-user relationship
    /// </summary>
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// DTO for company-user relationship with user and company details
/// </summary>
public class CompanyUserDetailsDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public DateTime ContractStartDate { get; set; }
    public DateTime? ContractEndDate { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? TerminatedAt { get; set; }
    public string? TerminationReason { get; set; }
}
