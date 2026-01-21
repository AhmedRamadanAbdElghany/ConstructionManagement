using ConstructionManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.DTOs.ProjectApprovalRule
{
    public record ProjectApprovalRuleDto(
        int Id,
        int ProjectId,
        int? BOQItemId,
        SourceType Source,
        string UploaderRole,
        string ApproverRole,
        int ResponseTimeoutHours,
        string? EscalationRole,
        DateTime CreatedAt);
}
