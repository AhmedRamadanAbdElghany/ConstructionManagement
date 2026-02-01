namespace ConstructionManagement.Application.DTOs;

public class CreateCompanyRequest
{
    public string Name { get; set; } = string.Empty;
    public int? PackageId { get; set; }
}
