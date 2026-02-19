using System.ComponentModel.DataAnnotations;

namespace ConstructionManagement.Application.DTOs.HR;

public class CertificationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? IssuingAuthority { get; set; }
    public DateTime? IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CertificateNumber { get; set; }
    public string? DocumentUrl { get; set; }
    public bool IsVerified { get; set; }
}

public class UpsertCertificationRequest
{
    [Required(ErrorMessage = "Certification name is required")]
    [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters")]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(200, ErrorMessage = "Issuing authority cannot exceed 200 characters")]
    public string? IssuingAuthority { get; set; }
    
    public DateTime? IssueDate { get; set; }
    
    public DateTime? ExpiryDate { get; set; }
    
    [StringLength(100, ErrorMessage = "Certificate number cannot exceed 100 characters")]
    public string? CertificateNumber { get; set; }
    
    [StringLength(500, ErrorMessage = "Document URL cannot exceed 500 characters")]
    public string? DocumentUrl { get; set; }
}
