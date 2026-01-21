using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.DTOs
{
    public record WorkerWithProjectsDto(
        int UserID,
        string FullName,
        string? Email,
        List<WorkerProjectRoleDto> Projects);
}
