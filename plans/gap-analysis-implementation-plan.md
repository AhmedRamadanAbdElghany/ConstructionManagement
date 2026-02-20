# خطة سد الفجوات في نظام إدارة الإنشاءات

## نظرة عامة

هذه الخطة تغطي 4 فجوات رئيسية في النظام:
1. إنفاذ الميزانية (Budget Hard-Stops)
2. جدولة الاستقطاع (Retention Scheduler)
3. نظام الإضافي (Overtime)
4. تحليل العائد على الاستثمار (ROI Analysis)

---

## 1. إنفاذ الميزانية (Budget Hard-Stops)

### المشكلة
لا يوجد "hard-stop" لمنع الفوترة بأكثر من المتفق عليه للبند.

### الحل

#### Backend

**1. إضافة حقول للميزانية في ProjectItem:**
```csharp
// في ProjectItem.cs
public decimal? BudgetAmount { get; set; } // الميزانية المخصصة للبند
public decimal? BudgetUsed { get; set; } // المبلغ المستخدم
public bool EnforceBudget { get; set; } // تفعيل إنفاذ الميزانية
```

**2. التحقق عند إنشاء فاتورة:**
```csharp
// في InvoiceService.CreateInvoiceAsync
if (item.EnforceBudget && item.BudgetAmount.HasValue)
{
    var totalInvoiced = await GetTotalInvoicedForItem(item.Id);
    var newTotal = totalInvoiced + request.NetAmount;
    
    if (newTotal > item.BudgetAmount.Value)
    {
        throw new BudgetExceededException(
            $"المبلغ يتجاوز ميزانية البند. الميزانية: {item.BudgetAmount}, المستخدم: {totalInvoiced}, المطلوب: {request.NetAmount}");
    }
}
```

**3. BudgetExceededException:**
```csharp
public class BudgetExceededException : Exception
{
    public decimal BudgetAmount { get; }
    public decimal UsedAmount { get; }
    public decimal RequestedAmount { get; }
    
    public BudgetExceededException(string message, decimal budget, decimal used, decimal requested)
        : base(message)
    {
        BudgetAmount = budget;
        UsedAmount = used;
        RequestedAmount = requested;
    }
}
```

#### Frontend

**1. عرض الميزانية في بطاقة البند:**
```html
<div class="budget-indicator">
    <span>الميزانية: {{ item.budgetAmount | currency }}</span>
    <span>المستخدم: {{ item.budgetUsed | currency }}</span>
    <div class="progress-bar">
        <div [style.width.%]="getBudgetPercentage(item)"></div>
    </div>
</div>
```

**2. تحذير عند تجاوز الميزانية:**
```typescript
// عند إنشاء فاتورة
if (item.budgetUsed + amount > item.budgetAmount) {
    this.showBudgetWarning(item, amount);
}
```

---

## 2. جدولة الاستقطاع (Retention Scheduler)

### المشكلة
لا توجد تذكيرات تلقائية لإطلاق الاستقطاع المحتجز بعد انتهاء فترة الصيانة.

### الحل

#### Backend

**1. إضافة حقول للاستقطاع:**
```csharp
// في ProgressInvoice.cs
public decimal RetentionAmount { get; set; }
public DateTime? RetentionReleaseDate { get; set; } // تاريخ إطلاق الاستقطاع
public bool RetentionReleased { get; set; }
public int RetentionPeriodMonths { get; set; } = 6; // فترة الصيانة بالأشهر
```

**2. RetentionSchedule Entity:**
```csharp
public class RetentionSchedule : BaseEntity
{
    public int ProjectId { get; set; }
    public int ProgressInvoiceId { get; set; }
    public decimal RetentionAmount { get; set; }
    public DateTime RetentionDate { get; set; } // تاريخ احتجاز الاستقطاع
    public DateTime ReleaseDate { get; set; } // تاريخ الإطلاق المتوقع
    public DateTime? ActualReleaseDate { get; set; }
    public RetentionStatus Status { get; set; }
    public string? Notes { get; set; }
}

public enum RetentionStatus
{
    Held = 1,       // محتجز
    DueForRelease = 2, // مستحق للإطلاق
    Released = 3,   // تم الإطلاق
    PartiallyReleased = 4 // تم الإطلاق جزئياً
}
```

**3. RetentionService:**
```csharp
public interface IRetentionService
{
    Task<List<RetentionSchedule>> GetPendingReleases(int companyId);
    Task ReleaseRetention(int scheduleId, decimal amount, string notes);
    Task CheckDueRetentions(); // يُنفذ يومياً
}
```

**4. Background Job:**
```csharp
// كل يوم في منتصف الليل
public async Task ExecuteAsync(CancellationToken cancellationToken)
{
    var dueRetentions = await _retentionService.GetDueRetentions();
    
    foreach (var retention in dueRetentions)
    {
        // إرسال إشعار للمستخدمين المختصين
        await _notificationService.SendRetentionDueNotification(retention);
        
        // تحديث الحالة
        retention.Status = RetentionStatus.DueForRelease;
    }
}
```

#### Frontend

**1. صفحة جدولة الاستقطاع:**
```html
<div class="retention-scheduler">
    <h2>الاستقطاعات المستحقة للإطلاق</h2>
    
    @for (retention of dueRetentions) {
        <div class="retention-card">
            <span>المشروع: {{ retention.projectName }}</span>
            <span>المبلغ: {{ retention.amount | currency }}</span>
            <span>تاريخ الاستحقاق: {{ retention.releaseDate | date }}</span>
            <button (click)="releaseRetention(retention.id)">إطلاق الاستقطاع</button>
        </div>
    }
</div>
```

---

## 3. نظام الإضافي (Overtime)

### المشكلة
لا يوجد منطق تلقائي لحساب ساعات الإضافي ومضاعفاتها.

### الحل

#### Backend

**1. OvertimeRule Entity:**
```csharp
public class OvertimeRule : BaseEntity
{
    public int CompanyId { get; set; }
    public string Name { get; set; } // "عادي", "جمعة", "عيد"
    public decimal Multiplier { get; set; } // 1.5, 2.0, 3.0
    public DayOfWeek? ApplicableDay { get; set; } // الجمعة
    public TimeSpan? StartTime { get; set; } // بعد الساعة 5 مساءً
    public TimeSpan? EndTime { get; set; }
    public bool IsActive { get; set; }
}
```

**2. OvertimeRecord Entity:**
```csharp
public class OvertimeRecord : BaseEntity
{
    public int UserId { get; set; }
    public int ProjectId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public decimal Hours { get; set; }
    public decimal Multiplier { get; set; }
    public decimal CalculatedAmount { get; set; }
    public OvertimeStatus Status { get; set; }
    public int? ApprovedByUserId { get; set; }
    public string? Notes { get; set; }
}

public enum OvertimeStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Paid = 4
}
```

**3. OvertimeService:**
```csharp
public interface IOvertimeService
{
    Task<decimal> CalculateOvertimeHours(int userId, DateTime date, TimeSpan start, TimeSpan end);
    Task<int> SubmitOvertimeRequest(CreateOvertimeRequest request);
    Task<bool> ApproveOvertime(int overtimeId, int approverId);
    Task<List<OvertimeRecord>> GetPendingApprovals(int managerId);
}
```

**4. حساب الإضافي:**
```csharp
public decimal CalculateOvertimeAmount(decimal baseHourlyRate, decimal hours, DayOfWeek day)
{
    var rule = GetApplicableRule(day);
    return baseHourlyRate * hours * rule.Multiplier;
}

private OvertimeRule GetApplicableRule(DayOfWeek day)
{
    // الجمعة = مضاعف 2
    // العطلات الرسمية = مضاعف 3
    // الأيام العادية = مضاعف 1.5
    return _rules.FirstOrDefault(r => r.ApplicableDay == day) 
        ?? _rules.First(r => r.ApplicableDay == null);
}
```

#### Frontend

**1. نموذج طلب إضافي:**
```html
<form [formGroup]="overtimeForm">
    <input type="date" formControlName="date">
    <input type="time" formControlName="startTime">
    <input type="time" formControlName="endTime">
    <select formControlName="projectId">
        <option *ngFor="let p of projects" [value]="p.id">{{ p.name }}</option>
    </select>
    <textarea formControlName="reason" placeholder="سبب الإضافي"></textarea>
    
    <div class="calculated-hours">
        الساعات: {{ calculatedHours }}
        المبلغ المتوقع: {{ estimatedAmount | currency }}
    </div>
</form>
```

---

## 4. تحليل العائد على الاستثمار (ROI Analysis)

### المشكلة
لا يوجد تقرير تلقائي لمقارنة تكاليف صيانة المعدات مقابل القيمة المضافة للمشروع.

### الحل

#### Backend

**1. EquipmentROI Entity:**
```csharp
public class EquipmentROI : BaseEntity
{
    public int EquipmentId { get; set; }
    public int ProjectId { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    
    // التكاليف
    public decimal FuelCost { get; set; }
    public decimal MaintenanceCost { get; set; }
    public decimal OperatorCost { get; set; }
    public decimal DepreciationCost { get; set; }
    public decimal TotalCost { get; set; }
    
    // العائد
    public decimal WorkValue { get; set; } // قيمة العمل المنجز
    public decimal HoursWorked { get; set; }
    
    // المؤشرات
    public decimal CostPerHour { get; set; }
    public decimal RevenuePerHour { get; set; }
    public decimal ROI_Percentage { get; set; }
}
```

**2. ROIReportDto:**
```csharp
public record ROIReportDto(
    int EquipmentId,
    string EquipmentName,
    string EquipmentType,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    
    // التكاليف
    decimal TotalMaintenanceCost,
    decimal TotalFuelCost,
    decimal TotalOperatingCost,
    decimal TotalCost,
    
    // العائد
    decimal TotalWorkValue,
    decimal TotalHoursWorked,
    int ProjectsCount,
    
    // المؤشرات
    decimal CostPerHour,
    decimal RevenuePerHour,
    decimal ProfitPerHour,
    decimal ROI_Percentage,
    string PerformanceRating // "ممتاز", "جيد", "ضعيف"
);
```

**3. ROIAnalysisService:**
```csharp
public interface IROIAnalysisService
{
    Task<ROIReportDto> GetEquipmentROI(int equipmentId, DateTime from, DateTime to);
    Task<List<ROIReportDto>> GetFleetROI(int companyId, DateTime from, DateTime to);
    Task<EquipmentUtilizationDto> GetUtilization(int equipmentId, DateTime from, DateTime to);
    Task<List<EquipmentCostBreakdownDto>> GetCostBreakdown(int equipmentId, DateTime from, DateTime to);
}
```

**4. حساب ROI:**
```csharp
public ROIReportDto CalculateROI(Equipment equipment, List<MaintenanceRecord> maintenance, List<EquipmentAssignment> assignments)
{
    var totalCost = maintenance.Sum(m => m.Cost) 
                  + assignments.Sum(a => a.FuelCost)
                  + equipment.DepreciationRate * equipment.PurchasePrice;
    
    var totalRevenue = assignments.Sum(a => a.WorkValue);
    
    var roi = totalRevenue > 0 
        ? ((totalRevenue - totalCost) / totalCost) * 100 
        : 0;
    
    return new ROIReportDto(
        // ... populate fields
        ROI_Percentage: roi,
        PerformanceRating: GetPerformanceRating(roi)
    );
}

private string GetPerformanceRating(decimal roi)
{
    if (roi >= 50) return "ممتاز";
    if (roi >= 25) return "جيد جداً";
    if (roi >= 10) return "جيد";
    if (roi >= 0) return "مقبول";
    return "ضعيف";
}
```

#### Frontend

**1. لوحة تحكم ROI:**
```html
<div class="roi-dashboard">
    <div class="summary-cards">
        <div class="card">
            <h3>إجمالي تكاليف المعدات</h3>
            <p class="amount">{{ totalCosts | currency }}</p>
        </div>
        <div class="card">
            <h3>إجمالي العائد</h3>
            <p class="amount">{{ totalRevenue | currency }}</p>
        </div>
        <div class="card">
            <h3>متوسط ROI</h3>
            <p class="percentage">{{ averageROI }}%</p>
        </div>
    </div>
    
    <div class="equipment-list">
        @for (item of equipmentROI) {
            <div class="equipment-card" [class.excellent]="item.roi >= 50" [class.poor]="item.roi < 0">
                <h4>{{ item.equipmentName }}</h4>
                <div class="metrics">
                    <span>التكلفة: {{ item.totalCost | currency }}</span>
                    <span>العائد: {{ item.totalRevenue | currency }}</span>
                    <span>ROI: {{ item.roi }}%</span>
                </div>
                <div class="rating">{{ item.performanceRating }}</div>
            </div>
        }
    </div>
    
    <div class="charts">
        <canvas id="costBreakdownChart"></canvas>
        <canvas id="roiTrendChart"></canvas>
    </div>
</div>
```

---

## ترتيب التنفيذ

### المرحلة 1: المالية (أولوية عالية)
1. [ ] إنفاذ الميزانية (Budget Hard-Stops)
2. [ ] جدولة الاستقطاع (Retention Scheduler)

### المرحلة 2: الموارد البشرية
3. [ ] نظام الإضافي (Overtime)

### المرحلة 3: التقارير والتحليلات
4. [ ] تحليل العائد على الاستثمار (ROI Analysis)

---

## ملاحظات

- جميع الميزات يجب أن تدعم تعدد الشركات (Multi-tenant)
- يجب إضافة الترجمات العربية والإنجليزية
- يجب ربط النظام بنظام الإشعارات الموجود
- يجب دعم تصدير التقارير إلى Excel/PDF
