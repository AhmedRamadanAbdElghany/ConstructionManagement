using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a phase in a construction project. 
/// Phases can be nested (parent-child relationship) to create a hierarchical structure.
/// BOQ items belong to phases.
/// </summary>
public class Phase : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; } = 0;  // For ordering within parent
    
    // Project relationship
    public int ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;
    
    // Self-referential parent (null for root phases)
    public int? ParentPhaseId { get; set; }
    [ForeignKey(nameof(ParentPhaseId))]
    public virtual Phase? ParentPhase { get; set; }
    
    // Child phases
    public virtual ICollection<Phase> ChildPhases { get; set; } = new List<Phase>();
    
    // Items (terminal nodes) - Project Items (بنود المشروع)
    public virtual ICollection<ProjectItem> Items { get; set; } = new List<ProjectItem>();
    
    // Computed helpers
    [NotMapped]
    public bool IsRootPhase => ParentPhaseId == null;
    
    [NotMapped]
    public bool IsLeafPhase => !ChildPhases.Any();
}
