using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

public class BOQExecutedDelta : BaseEntity
{
    public int BOQItemId { get; set; }

    [ForeignKey(nameof(BOQItemId))]
    public virtual BOQItem BOQItem { get; set; } = null!;

    /// <summary>
    /// الكمية الإضافية في هذا التغيير (ممكن تكون سالبة لو تصحيح)
    /// </summary>
    public decimal DeltaQuantity { get; set; }

    public DateTime DeltaDate { get; set; } = DateTime.UtcNow.Date;

    /// <summary>
    /// نوع التغيير: DailyLog, ManualAdjustment, Correction
    /// </summary>
    public string ChangeType { get; set; } = string.Empty;

    /// <summary>
    /// مرجع التغيير (مثل ID اليومية أو التعديل)
    /// </summary>
    public int? ReferenceId { get; set; }

    public int CreatedByUserId { get; set; }

    [ForeignKey(nameof(CreatedByUserId))]
    public virtual User CreatedBy { get; set; } = null!;

    /// <summary>
    /// وقت معالجة الـ Delta في الـ batch job (لمعرفة إيه اللي اتعالج وإيه لسه)
    /// </summary>
    public DateTime? ProcessedAt { get; set; }
}