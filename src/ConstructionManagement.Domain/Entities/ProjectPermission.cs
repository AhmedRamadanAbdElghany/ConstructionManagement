using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Domain.Entities
{
    public class ProjectPermission : BaseEntity
    {
        public string Name { get; set; } = string.Empty; // "CanReviewMedia"
        public string? Description { get; set; }
        public virtual ICollection<ProjectRolePermission> RolePermissions { get; set; }
            = new List<ProjectRolePermission>();
    }
}