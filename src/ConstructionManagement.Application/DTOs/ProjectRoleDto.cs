using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.DTOs
{
    public class ProjectRoleDto {
        public int ProjectRoleID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; } = null;

    }
}
