using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Domain.Entities
{
    public abstract class BaseEntity : IAuditableEntity
    {
        public int Id { get; set; } // تأكد أن هذا الحقل موجود هنا
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
