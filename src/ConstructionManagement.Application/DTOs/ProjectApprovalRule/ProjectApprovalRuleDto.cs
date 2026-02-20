using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.DTOs.ProjectApprovalRule
{
    public record ProjectApprovalRuleDto(
        int Id,
        int ProjectId,
        int? ProjectItemId,
        SourceType Source,
        string UploaderRole,
        string ApproverRole,
        int ResponseTimeoutHours,
        string? EscalationRole,
        DateTime CreatedAt);
}
