using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.DTOs.ProjectApprovalRule
{
    public record CreateApprovalRuleRequest(
        SourceType Source,
        string UploaderRole,
        string ApproverRole,
        int ResponseTimeoutHours = 48,
        string? EscalationRole = null,
        int? ProjectItemId = null             // null = عام للمشروع
    );
}
