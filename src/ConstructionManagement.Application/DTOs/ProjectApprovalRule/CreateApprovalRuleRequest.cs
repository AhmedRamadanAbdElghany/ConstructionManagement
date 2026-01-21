using ConstructionManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.DTOs.ProjectApprovalRule
{
    public record CreateApprovalRuleRequest(
        SourceType Source,
        string UploaderRole,
        string ApproverRole,
        int ResponseTimeoutHours = 48,
        string? EscalationRole = null,
        int? BOQItemId = null             // null = عام للمشروع
    );
}
