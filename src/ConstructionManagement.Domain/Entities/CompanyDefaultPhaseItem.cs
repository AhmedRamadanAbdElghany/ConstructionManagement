using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

public class CompanyDefaultPhaseItem : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company Company { get; set; } = null!;

    public int DefaultPhaseId { get; set; }
    [ForeignKey(nameof(DefaultPhaseId))]
    public virtual CompanyDefaultPhase DefaultPhase { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal DefaultRate { get; set; }
    public string? Category { get; set; }
    public int Order { get; set; }
}
