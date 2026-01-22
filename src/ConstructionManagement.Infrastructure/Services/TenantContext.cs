using ConstructionManagement.Application.Interfaces;

namespace ConstructionManagement.Infrastructure.Services; // or Application.Common

public class TenantContext : ITenantContext
{
    public Guid? TenantId { get; set; }
}