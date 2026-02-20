namespace ConstructionManagement.Application.DTOs;

public record PhaseDto(
    int Id,
    string Name,
    string? Description,
    int Order,
    int? ParentPhaseId,
    bool IsLeaf,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    IEnumerable<PhaseDto>? Children = null,
    IEnumerable<ProjectItemDto>? Items = null
);

public record CreatePhaseRequest(
    string Name,
    string? Description = null,
    int? ParentPhaseId = null,
    int? Order = 0
);

public record UpdatePhaseRequest(
    string? Name = null,
    string? Description = null,
    int? Order = null
);
