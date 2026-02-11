using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Domain.Entities;

public class CatalogItem : BaseEntity
{
    public int? CompanyId { get; set; }
    public int? ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Unit { get; set; } = "Each";
    public decimal? DefaultRate { get; set; }
    public string? Category { get; set; }
}
