using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Project Item (بند المشروع) – the main building block of the project cost structure
/// Note: Accounting method is determined by Project.AccountingSystem, not per-item
/// All items in a project use the same accounting method
/// </summary>
public class ProjectItem : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    // -- Identification & Basic Info -------------------------------------------
    public string ItemCode { get; set; } = string.Empty;        // unique code from contract
    public string ItemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Unit { get; set; }                           // m³, m², ton, lump sum, etc.

    // -- Status ---------------------------------------------------
    public string Status { get; set; } = "جديد";               // New, InProgress, Delayed, Completed, etc.

    // -- Project Relationship --------------------------------------------------
    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    // -- Phase Relationship (optional for flexibility) -------------------------
    public int? PhaseId { get; set; }

    [ForeignKey(nameof(PhaseId))]
    public virtual Phase? Phase { get; set; }

    // -- Schedule --------------------------------------------------------------
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // -- Measured System Fields (for projects with AccountingSystem = Measured) --
    /// <summary>الكمية المتفق عليها - للمشاريع بنظام المقايسة</summary>
    public decimal? AgreedQuantity { get; set; }
    
    /// <summary>الكمية المنفذة - للمشاريع بنظام المقايسة</summary>
    public decimal? ExecutedQuantity { get; set; }
    
    /// <summary>سعر الوحدة - للمشاريع بنظام المقايسة</summary>
    public decimal? UnitPrice { get; set; }

    // -- Supervision System Fields (for projects with AccountingSystem = Supervision) --
    /// <summary>التكلفة المقدرة - للمشاريع بنظام الإشراف</summary>
    public decimal? EstimatedTotalCost { get; set; }
    
    /// <summary>نسبة الإشراف - للمشاريع بنظام الإشراف</summary>
    public decimal? SupervisionPercentage { get; set; }

    // -- Package System Fields (for projects with AccountingSystem = Packages) --
    /// <summary>قيمة الباقة - للمشاريع بنظام الباقات</summary>
    public decimal? TotalPackageValue { get; set; }
    
    /// <summary>شروط الدفع - للمشاريع بنظام الباقات</summary>
    public string? PaymentTerms { get; set; }
    
    /// <summary>نسبة الإنجاز - للمشاريع بنظام الباقات</summary>
    public decimal? CompletionPercentage { get; set; }

    // -- Budget Enforcement Fields ----------------------------------------------
    /// <summary>الميزانية المخصصة للبند (للتحكم في المصروفات)</summary>
    public decimal? BudgetAmount { get; set; }
    
    /// <summary>المبلغ المستخدم (محسوب من الفواتير المعتمدة)</summary>
    public decimal? BudgetUsed { get; set; }
    
    /// <summary>تفعيل إنفاذ الميزانية - منع الفوترة بأكثر من الميزانية</summary>
    public bool EnforceBudget { get; set; } = false;
    
    /// <summary>نسبة التحذير - إرسال تنبيه عند تجاوز هذه النسبة من الميزانية</summary>
    public decimal BudgetWarningThreshold { get; set; } = 80; // 80% default

    // -- Navigation Collections ------------------------------------------------
    public virtual ICollection<SiteMedia> SiteMedias { get; set; }
        = new List<SiteMedia>();

    public virtual ICollection<ItemInvoice> Invoices { get; set; }
        = new List<ItemInvoice>();

    public virtual ICollection<ItemDailyLog> DailyLogs { get; set; }
        = new List<ItemDailyLog>();

    public virtual ICollection<ProjectItemNote> Notes { get; set; }
        = new List<ProjectItemNote>();

    public virtual ICollection<EscalationLog> EscalationLogs { get; set; }
        = new List<EscalationLog>();

    public virtual ICollection<ProjectItemProfitabilityLog> ProfitabilityLogs { get; set; }
        = new List<ProjectItemProfitabilityLog>();

    public virtual ICollection<Transaction> Transactions { get; set; }
        = new List<Transaction>();

    public virtual ICollection<ProjectItemExecutedDelta> ExecutedDeltas { get; set; }
        = new List<ProjectItemExecutedDelta>();

    public virtual ICollection<ProjectItemTask> Tasks { get; set; }
        = new List<ProjectItemTask>();

    // -- Workflow & Escalation --------------------------------------------------
    public ProjectItemWorkflowStatus WorkflowStatus { get; set; } = ProjectItemWorkflowStatus.Pending;

    public bool RequiresPreStartConfirmation { get; set; } = true;
    public DateTime? PreStartConfirmationDeadline { get; set; }
    public DateTime? PreStartConfirmedAt { get; set; }
    public int? PreStartConfirmedByUserId { get; set; }

    [ForeignKey(nameof(PreStartConfirmedByUserId))]
    public virtual User? PreStartConfirmedByUser { get; set; }

    public string? PreStartConfirmationNotes { get; set; }

    public bool IsForcedStart { get; set; } = false;
    public int? ForcedStartAuthorizedByUserId { get; set; }

    [ForeignKey(nameof(ForcedStartAuthorizedByUserId))]
    public virtual User? ForcedStartAuthorizedByUser { get; set; }

    public DateTime? ForcedStartAuthorizedAt { get; set; }
    public string? ForcedStartReason { get; set; }

    public int? ResponsibleUserId { get; set; }

    [ForeignKey(nameof(ResponsibleUserId))]
    public virtual User? ResponsibleUser { get; set; }

    public decimal? EstimatedRemainingDays { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public DateTime? LastDailyLogDate { get; set; }
    public decimal? LastProgressPercentage { get; set; }


    // -- Computed Properties (not stored in DB) --------------------------------
    /// <summary>
    /// Contract value / estimated budget for this item
    /// Depends on Project.AccountingSystem
    /// </summary>
    [NotMapped]
    public decimal EstimatedBudget
    {
        get
        {
            var accountingSystem = Project?.AccountingSystem ?? Domain.Enums.CalculationMethod.Measured;
            
            return accountingSystem switch
            {
                Domain.Enums.CalculationMethod.Measured => (AgreedQuantity ?? 0) * (UnitPrice ?? 0),
                Domain.Enums.CalculationMethod.Packages => TotalPackageValue ?? 0,
                Domain.Enums.CalculationMethod.Supervision => EstimatedTotalCost ?? 0,
                _ => 0
            };
        }
    }

    /// <summary>
    /// Progress percentage based on executed vs agreed quantities (for Measured system)
    /// </summary>
    [NotMapped]
    public decimal ProgressPercentage
    {
        get
        {
            if (AgreedQuantity == null || AgreedQuantity == 0 || ExecutedQuantity == null)
                return 0;
            
            return Math.Min(100, (ExecutedQuantity.Value / AgreedQuantity.Value) * 100);
        }
    }
}
