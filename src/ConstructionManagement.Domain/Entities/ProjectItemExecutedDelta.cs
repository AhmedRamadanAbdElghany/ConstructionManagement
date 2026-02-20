using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

public class ProjectItemExecutedDelta : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    public int ProjectItemId { get; set; }

    [ForeignKey(nameof(ProjectItemId))]
    public virtual ProjectItem ProjectItem { get; set; } = null!;

    /// <summary>
    /// التغير في الكمية المنفذة (موجب أو سالب)
    /// </summary>
    public decimal DeltaQuantity { get; set; }

    public DateTime DeltaDate { get; set; } = DateTime.UtcNow.Date;

    /// <summary>
    /// نوع التغيير: DailyLog, ManualAdjustment, Correction
    /// </summary>
    public string ChangeType { get; set; } = string.Empty;

    /// <summary>
    /// مرجع التغيير (مثلاً ID اليومية من اليوميات)
    /// </summary>
    public int? ReferenceId { get; set; }

    public int CreatedByUserId { get; set; }

    [ForeignKey(nameof(CreatedByUserId))]
    public virtual User CreatedBy { get; set; } = null!;

    /// <summary>
    /// تاريخ المعالجة للـ Delta في حالة batch job (يُملأ عند التجميع الفعلي)
    /// </summary>
    public DateTime? ProcessedAt { get; set; }
}
