namespace ConstructionManagement.Application.Interfaces;

public interface ICompanyContext
{
    int? CompanyId { get; set; }
    int? CurrentUserId { get; set; }
}
