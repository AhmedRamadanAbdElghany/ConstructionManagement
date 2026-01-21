using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.DTOs
{
    public record WorkerProjectRoleDto(
        int ProjectID,
        string ProjectName,
        List<string> Roles,           // e.g. ["SiteEngineer", "Approver"]
        DateTime AssignedDate);
}
