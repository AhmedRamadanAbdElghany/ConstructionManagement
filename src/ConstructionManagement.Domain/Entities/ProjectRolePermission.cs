using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
// many to many 
namespace ConstructionManagement.Domain.Entities
{
    public class ProjectRolePermission
    {
        [ForeignKey(nameof(RoleId))]
        public int RoleId { get; set; }
        [ForeignKey(nameof(PermissionId))]
        public int PermissionId { get; set; }

        public virtual Role Role { get; set; } = null!;
        public virtual ProjectPermission Permission { get; set; } = null!;
    }
}