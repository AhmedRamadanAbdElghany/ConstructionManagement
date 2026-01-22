namespace ConstructionManagement.Application.Interfaces;

public interface ITenantContext
{
    Guid? TenantId { get; set; }
}