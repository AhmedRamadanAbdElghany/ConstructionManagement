using ConstructionManagement.Domain.Entities;

public class Package : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // "Super", "Super Lux", "Premium", "Free"
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; } = 0m; // السعر (0 = مجاني)

    // حدود خاصة بالمشروع اللي مختار الباقة دي
    public int MaxTeamMembers { get; set; } = 5;         // عدد أعضاء الفريق في المشروع
    public int MaxDailyPhotos { get; set; } = 20;        // عدد الصور/الفيديوهات يوميًا
    public int MaxBOQItems { get; set; } = 50;           // عدد بنود BOQ
    public bool AllowAdvancedReports { get; set; } = false;
    public bool AllowCustomBranding { get; set; } = false;
    public bool AllowAIAssistance { get; set; } = false; // مثال: استخدام Gemini AI

    // علاقة مع المشاريع
    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();

    // NOTE: Add tests for limits enforcement in project creation.
}