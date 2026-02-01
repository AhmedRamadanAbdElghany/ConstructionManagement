using System.ComponentModel.DataAnnotations.Schema;
// many to many 
namespace ConstructionManagement.Domain.Entities
{
    public class RolePermission : ICompanyEntity
    {
        public int? CompanyId { get; set; }

        [ForeignKey(nameof(RoleId))]
        public int RoleId { get; set; }
        [ForeignKey(nameof(PermissionId))]
        public int PermissionId { get; set; }

        public virtual Role Role { get; set; } = null!;
        public virtual Permission Permission { get; set; } = null!;
    }
}
