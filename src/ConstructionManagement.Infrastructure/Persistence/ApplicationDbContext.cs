using ConstructionManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ConstructionManagement.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // ── Core / Identity ─────────────────────────────────────────────────────────
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    // ── Projects & Structure ────────────────────────────────────────────────────
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTeamMember> ProjectTeam => Set<ProjectTeamMember>();
    public DbSet<ProjectTeamRole> ProjectTeamRoles => Set<ProjectTeamRole>();
    public DbSet<ProjectRole> ProjectRoles => Set<ProjectRole>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<ProjectSettings> ProjectSettings => Set<ProjectSettings>();
    public DbSet<ProjectApprovalRule> ProjectApprovalRules => Set<ProjectApprovalRule>();

    // ── BOQ & Progress Tracking ─────────────────────────────────────────────────
    public DbSet<BOQItem> BOQItems => Set<BOQItem>();
    public DbSet<BOQMeasured> BOQMeasured => Set<BOQMeasured>();
    public DbSet<BOQSupervision> BOQSupervision => Set<BOQSupervision>();
    public DbSet<ItemDailyLog> ItemDailyLogs => Set<ItemDailyLog>();

    // ── Financial & Review Flow ─────────────────────────────────────────────────
    public DbSet<ItemInvoice> ItemInvoices => Set<ItemInvoice>();
    public DbSet<ClientPayment> ClientPayments => Set<ClientPayment>();

    // ── Media & Documentation ───────────────────────────────────────────────────
    public DbSet<SiteMedia> SiteMedias => Set<SiteMedia>();
    public DbSet<BOQItemNote> BOQItemNotes => Set<BOQItemNote>();
    public DbSet<BOQProfitabilityLog> BOQProfitabilityLogs => Set<BOQProfitabilityLog>();
    public DbSet<EscalationLog> EscalationLogs => Set<EscalationLog>();

    // ── Notifications ───────────────────────────────────────────────────────────
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ────────────────────────────────────────────────────────────────
        // 1. Project ↔ ProjectSettings (1:1 – shared PK)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ProjectSettings>()
            .HasKey(ps => ps.Id);
        modelBuilder.Entity<ProjectSettings>()
            .HasOne(ps => ps.Project)
            .WithOne(p => p.Settings)
            .HasForeignKey<ProjectSettings>(ps => ps.Id)
            .OnDelete(DeleteBehavior.Cascade); // آمن هنا لأنه 1:1

        // ────────────────────────────────────────────────────────────────
        // 2. Project ↔ BOQItem (1:N) ← Restrict لتجنب التعارض
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<BOQItem>()
            .HasOne(bi => bi.Project)
            .WithMany(p => p.BOQItems)
            .HasForeignKey(bi => bi.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);   // ← التعديل المهم

        // ────────────────────────────────────────────────────────────────
        // 3. BOQItem ↔ BOQMeasured / BOQSupervision (1:1 – shared PK)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<BOQMeasured>()
            .HasKey(m => m.Id);
        modelBuilder.Entity<BOQMeasured>()
            .HasOne(m => m.Item)
            .WithOne(i => i.MeasuredData)
            .HasForeignKey<BOQMeasured>(m => m.Id)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BOQSupervision>()
            .HasKey(s => s.Id);
        modelBuilder.Entity<BOQSupervision>()
            .HasOne(s => s.Item)
            .WithOne(i => i.SupervisionData)
            .HasForeignKey<BOQSupervision>(s => s.Id)
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 4. User ↔ UserRole (many-to-many)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 5. ProjectTeamMember ↔ ProjectTeamRole (many-to-many bridge)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ProjectTeamRole>()
            .HasKey(ptr => new { ptr.ProjectTeamMemberId, ptr.ProjectRoleId });

        modelBuilder.Entity<ProjectTeamRole>()
            .HasOne(ptr => ptr.ProjectTeamMember)
            .WithMany(ptm => ptm.ProjectTeamRoles)
            .HasForeignKey(ptr => ptr.ProjectTeamMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectTeamRole>()
            .HasOne(ptr => ptr.ProjectRole)
            .WithMany(pr => pr.Assignments)
            .HasForeignKey(ptr => ptr.ProjectRoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // ────────────────────────────────────────────────────────────────
        // 6. ProjectTeamMember relationships
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ProjectTeamMember>()
            .HasOne(ptm => ptm.Project)
            .WithMany(p => p.TeamMembers)
            .HasForeignKey(ptm => ptm.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectTeamMember>()
            .HasOne(ptm => ptm.User)
            .WithMany(u => u.ProjectMemberships)
            .HasForeignKey(ptm => ptm.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectTeamMember>()
            .HasOne(ptm => ptm.ReportsTo)
            .WithMany()
            .HasForeignKey(ptm => ptm.ReportsToUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<ProjectTeamMember>()
            .HasIndex(ptm => new { ptm.ProjectId, ptm.UserId })
            .IsUnique();

        // ────────────────────────────────────────────────────────────────
        // 7. Project children – Restrict لتجنب multiple cascade paths
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ClientPayment>()
            .HasOne(cp => cp.Project)
            .WithMany(p => p.ClientPayments)
            .HasForeignKey(cp => cp.ProjectId)
            .OnDelete(DeleteBehavior.Cascade); // آمن هنا

        modelBuilder.Entity<EscalationLog>()
            .HasOne(el => el.Project)
            .WithMany(p => p.EscalationLogs)
            .HasForeignKey(el => el.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EscalationLog>()
            .HasOne(el => el.BOQItem)
            .WithMany(i => i.EscalationLogs)
            .HasForeignKey(el => el.BOQItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ItemInvoice>()
            .HasOne(ii => ii.Project)
            .WithMany(p => p.ItemInvoices)
            .HasForeignKey(ii => ii.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ItemInvoice>()
            .HasOne(ii => ii.BOQItem)
            .WithMany(b => b.Invoices)
            .HasForeignKey(ii => ii.BOQItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SiteMedia>()
            .HasOne(sm => sm.Project)
            .WithMany(p => p.SiteMedias)
            .HasForeignKey(sm => sm.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SiteMedia>()
            .HasOne(sm => sm.BOQItem)
            .WithMany(b => b.SiteMedias)
            .HasForeignKey(sm => sm.BOQItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.Project)
            .WithMany(p => p.Transactions)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.BOQItem)
            .WithMany()
            .HasForeignKey(t => t.BOQItemId)
            .OnDelete(DeleteBehavior.Restrict);

        // ────────────────────────────────────────────────────────────────
        // 8. BOQItem children – Cascade آمن هنا لأنهم أولاد مباشرين
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ItemDailyLog>()
            .HasOne(dl => dl.BOQItem)
            .WithMany(b => b.DailyLogs)
            .HasForeignKey(dl => dl.BOQItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BOQItemNote>()
            .HasOne(n => n.BOQItem)
            .WithMany(b => b.Notes)
            .HasForeignKey(n => n.BOQItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BOQProfitabilityLog>()
            .HasOne(pl => pl.BOQItem)
            .WithMany(b => b.ProfitabilityLogs)
            .HasForeignKey(pl => pl.BOQItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 9. User relationships (CreatedBy, ClosedBy, Reviewer, Uploader, etc.)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ItemDailyLog>()
            .HasOne(dl => dl.CreatedByUser)
            .WithMany()
            .HasForeignKey(dl => dl.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(true);

        modelBuilder.Entity<ItemDailyLog>()
            .HasOne(dl => dl.ClosedByUser)
            .WithMany()
            .HasForeignKey(dl => dl.ClosedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<Project>()
            .HasOne(p => p.Owner)
            .WithMany(u => u.OwnedProjects)
            .HasForeignKey(p => p.OwnerUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(true);

        modelBuilder.Entity<Project>()
            .HasOne(p => p.GeneralManager)
            .WithMany(u => u.ManagedProjects)
            .HasForeignKey(p => p.GeneralManagerUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<Project>()
            .HasOne(p => p.ClosedBy)
            .WithMany(u => u.ClosedProjects)
            .HasForeignKey(p => p.ClosedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<SiteMedia>()
            .HasOne(sm => sm.Uploader)
            .WithMany(u => u.UploadedMedias)
            .HasForeignKey(sm => sm.UploaderUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(true);

        modelBuilder.Entity<SiteMedia>()
            .HasOne(sm => sm.Reviewer)
            .WithMany(u => u.ReviewedMedias)
            .HasForeignKey(sm => sm.ReviewerUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.CreatedBy)
            .WithMany(u => u.CreatedTransactions)
            .HasForeignKey(t => t.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(true);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.ReviewedBy)
            .WithMany(u => u.ReviewedTransactions)
            .HasForeignKey(t => t.ReviewedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // ────────────────────────────────────────────────────────────────
        // 10. Notifications
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 11. Many-to-Many Configurations
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ProjectRolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        modelBuilder.Entity<ProjectRolePermission>()
            .HasOne(rp => rp.Role)
            .WithMany(r => r.Permissions)
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProjectRolePermission>()
            .HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProjectRole>()
            .HasOne(pr => pr.Project)
            .WithMany(p => p.ProjectRoles)
            .HasForeignKey(pr => pr.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 12. Global decimal precision (18,2)
        // ────────────────────────────────────────────────────────────────
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetColumnType("decimal(18,2)");
        }

        // ────────────────────────────────────────────────────────────────
        // 13. Useful indexes
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<BOQItem>()
            .HasIndex(b => b.ProjectId);

        modelBuilder.Entity<ItemDailyLog>()
            .HasIndex(d => new { d.BOQItemId, d.LogDate })
            .IsUnique();

        // ────────────────────────────────────────────────────────────────
        // 14. Seed Data
        // ────────────────────────────────────────────────────────────────
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        var now = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // 1. Project Permissions
        modelBuilder.Entity<ProjectPermission>().HasData(
            new ProjectPermission { Id = 1, Name = "Project.Edit", Description = "تعديل بيانات المشروع", CreatedAt = now },
            new ProjectPermission { Id = 2, Name = "Project.Close", Description = "إغلاق/إنهاء المشروع", CreatedAt = now },
            new ProjectPermission { Id = 3, Name = "Financials.View", Description = "عرض الملخص المالي", CreatedAt = now },
            new ProjectPermission { Id = 4, Name = "Transaction.Add", Description = "إضافة معاملة مالية", CreatedAt = now },
            new ProjectPermission { Id = 5, Name = "Transaction.Review", Description = "مراجعة/اعتماد المعاملات", CreatedAt = now },
            new ProjectPermission { Id = 6, Name = "Media.Review", Description = "مراجعة الصور والفيديوهات", CreatedAt = now },
            new ProjectPermission { Id = 7, Name = "DailyLog.Close", Description = "إغلاق السجل اليومي", CreatedAt = now },
            new ProjectPermission { Id = 8, Name = "Invoice.Approve", Description = "اعتماد الفواتير", CreatedAt = now },
            new ProjectPermission { Id = 9, Name = "Settings.Manage", Description = "تعديل إعدادات المشروع", CreatedAt = now }
        );

        // 2. Global Roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "SuperAdmin", Description = "مدير النظام الكلي", CreatedAt = now },
            new Role { Id = 2, Name = "CompanyAdmin", Description = "مدير الشركة", CreatedAt = now },
            new Role { Id = 3, Name = "ProjectManager", Description = "مدير مشروع", CreatedAt = now }
        );

        // 3. Users
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, FullName = "Super Admin", Email = "superadmin@demo.com", PasswordHash = "$2a$11$7r6fX9k2YvQ8mP3nL5tJ2eW9xH4kR8vB2cN6jQ1pT5yU3mW9xK8v", CreatedAt = now },
            new User { Id = 2, FullName = "أحمد مدير المشروع", Email = "ahmed.pm@demo.com", PasswordHash = "$2a$11$7r6fX9k2YvQ8mP3nL5tJ2eW9xH4kR8vB2cN6jQ1pT5yU3mW9xK8v", CreatedAt = now },
            new User { Id = 3, FullName = "مهندس ميداني", Email = "site.engineer@demo.com", PasswordHash = "$2a$11$7r6fX9k2YvQ8mP3nL5tJ2eW9xH4kR8vB2cN6jQ1pT5yU3mW9xK8v", CreatedAt = now }
        );

        modelBuilder.Entity<UserRole>().HasData(
            new UserRole { UserId = 1, RoleId = 1, AssignedAt = now },
            new UserRole { UserId = 2, RoleId = 3, AssignedAt = now }
        );

        // 4. Project
        modelBuilder.Entity<Project>().HasData(
            new Project
            {
                Id = 1,
                ProjectName = "مشروع تجريبي - فيلا القاهرة الجديدة",
                Description = "مشروع سكني تجريبي لاختبار النظام",
                StartDate = now.AddMonths(-2),
                Status = "جاري",
                OwnerUserId = 1,
                GeneralManagerUserId = 2,
                AccountingSystem = "Mixed",
                TotalContractValue = 8500000m,
                CreatedAt = now
            }
        );

        // 5. ProjectRoles
        modelBuilder.Entity<ProjectRole>().HasData(
            new ProjectRole { Id = 1, ProjectId = 1, Name = "مدير المشروع", Description = "له جميع الصلاحيات تقريباً", CreatedAt = now },
            new ProjectRole { Id = 2, ProjectId = 1, Name = "مهندس ميداني", Description = "رفع صور وتسجيل يومي", CreatedAt = now },
            new ProjectRole { Id = 3, ProjectId = 1, Name = "مراجع فني", Description = "مراجعة الصور والتقدم", CreatedAt = now }
        );

        // 6. ProjectRolePermission
        modelBuilder.Entity<ProjectRolePermission>().HasData(
            new ProjectRolePermission { RoleId = 1, PermissionId = 1 },
            new ProjectRolePermission { RoleId = 1, PermissionId = 2 },
            new ProjectRolePermission { RoleId = 1, PermissionId = 3 },
            new ProjectRolePermission { RoleId = 1, PermissionId = 4 },
            new ProjectRolePermission { RoleId = 1, PermissionId = 5 },
            new ProjectRolePermission { RoleId = 1, PermissionId = 6 },
            new ProjectRolePermission { RoleId = 1, PermissionId = 7 },
            new ProjectRolePermission { RoleId = 1, PermissionId = 8 },
            new ProjectRolePermission { RoleId = 1, PermissionId = 9 },
            new ProjectRolePermission { RoleId = 2, PermissionId = 4 },
            new ProjectRolePermission { RoleId = 2, PermissionId = 6 },
            new ProjectRolePermission { RoleId = 2, PermissionId = 7 },
            new ProjectRolePermission { RoleId = 3, PermissionId = 5 },
            new ProjectRolePermission { RoleId = 3, PermissionId = 6 },
            new ProjectRolePermission { RoleId = 3, PermissionId = 8 }
        );

        // 7. ProjectTeamMember
        modelBuilder.Entity<ProjectTeamMember>().HasData(
            new ProjectTeamMember { Id = 1, ProjectId = 1, UserId = 2, ReportsToUserId = null, CreatedAt = now },
            new ProjectTeamMember { Id = 2, ProjectId = 1, UserId = 3, ReportsToUserId = 2, CreatedAt = now }
        );

        // 8. ProjectTeamRole
        modelBuilder.Entity<ProjectTeamRole>().HasData(
            new ProjectTeamRole { ProjectTeamMemberId = 1, ProjectRoleId = 1, AssignedAt = now },
            new ProjectTeamRole { ProjectTeamMemberId = 2, ProjectRoleId = 2, AssignedAt = now }
        );

        // 9. ProjectSettings
        modelBuilder.Entity<ProjectSettings>().HasData(
            new ProjectSettings
            {
                Id = 1,
                EnableDelayNotification = true,
                DelayNotificationIsOneTimeOnly = false,
                DelayNotificationIntervalDays = 5,
                DelayNotificationSendEmail = true,
                DelayGracePeriodDays = 3,
                EnablePhotoUpload = true,
                RequirePhotoReview = true,
                PhotoApproverRole = "مراجع فني",
                EnableInvoiceReview = true,
                EnableInvoiceAggregation = true,
                MaxPhotosPerUpload = 15,
                CreatedAt = now
            }
        );

        // 10. BOQItems
        modelBuilder.Entity<BOQItem>().HasData(
            new BOQItem { Id = 1, ProjectId = 1, ItemCode = "A-01", ItemName = "حفر أساسات", Unit = "م³", AccountingType = "Measured", Status = "جاري", CreatedAt = now },
            new BOQItem { Id = 2, ProjectId = 1, ItemCode = "B-02", ItemName = "صب خرسانة أساسات", Unit = "م³", AccountingType = "Measured", Status = "جديد", CreatedAt = now },
            new BOQItem { Id = 3, ProjectId = 1, ItemCode = "C-01", ItemName = "إشراف عام على الموقع", AccountingType = "Supervision", Status = "جاري", CreatedAt = now }
        );

        // 11. BOQMeasured
        modelBuilder.Entity<BOQMeasured>().HasData(
            new BOQMeasured { Id = 1, AgreedQuantity = 1200m, UnitPrice = 450m, ExecutedQuantity = 480m, CreatedAt = now },
            new BOQMeasured { Id = 2, AgreedQuantity = 800m, UnitPrice = 1850m, ExecutedQuantity = 0m, CreatedAt = now }
        );

        // 12. BOQSupervision
        modelBuilder.Entity<BOQSupervision>().HasData(
            new BOQSupervision { Id = 3, SupervisionPercentage = 8.5m, BaseCalculation = "AllProjectInvoices", EstimatedTotalCost = 0m, CreatedAt = now }
        );
    }

    // ── Audit Logic ─────────────────────────────────────────────────────────────
    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditFields()
    {
        var now = DateTime.UtcNow;
        var entries = ChangeTracker.Entries<IAuditableEntity>()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
            }
            entry.Entity.UpdatedAt = now;
        }
    }
}