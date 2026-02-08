using ConstructionManagement.Application.Interfaces;

namespace ConstructionManagement.Infrastructure.Services;

public class CompanyContext : ICompanyContext
{
    public int? CompanyId { get; set; }
    public int? CurrentUserId { get; set; }
}
