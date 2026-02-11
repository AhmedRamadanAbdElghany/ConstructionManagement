using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a default phase structure at the company level.
/// These are used as templates for new projects.
/// </summary>
public class CompanyDefaultPhase : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company Company { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; } = 0;

    public int? ParentId { get; set; }
    [ForeignKey(nameof(ParentId))]
    public virtual CompanyDefaultPhase? Parent { get; set; }

    public virtual ICollection<CompanyDefaultPhase> Children { get; set; } = new List<CompanyDefaultPhase>();
    public virtual ICollection<CompanyDefaultPhaseItem> Items { get; set; } = new List<CompanyDefaultPhaseItem>();
}
