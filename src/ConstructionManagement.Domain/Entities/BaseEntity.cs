namespace ConstructionManagement.Domain.Entities
{
    public abstract class BaseEntity : IAuditableEntity
    {
        public int Id { get; set; } // تأكد أن هذا الحقل موجود هنا
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
    }
}
