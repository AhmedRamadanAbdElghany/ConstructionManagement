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

    // ── DbSets ──────────────────────────────────────────────────────────────────
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<ProjectRolePermission> ProjectRolePermissions => Set<ProjectRolePermission>();

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTeamMember> ProjectTeam => Set<ProjectTeamMember>();
    public DbSet<ProjectTeamRole> ProjectTeamRoles => Set<ProjectTeamRole>();
    public DbSet<ProjectRole> ProjectRoles => Set<ProjectRole>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<ProjectSettings> ProjectSettings => Set<ProjectSettings>();
    public DbSet<ProjectApprovalRule> ProjectApprovalRules => Set<ProjectApprovalRule>();
    public DbSet<CompanySettings> CompanySettings => Set<CompanySettings>();

    public DbSet<BOQItem> BOQItems => Set<BOQItem>();
    public DbSet<BOQMeasured> BOQMeasured => Set<BOQMeasured>();
    public DbSet<BOQSupervision> BOQSupervision => Set<BOQSupervision>();
    public DbSet<ItemDailyLog> ItemDailyLogs => Set<ItemDailyLog>();

    public DbSet<ItemInvoice> ItemInvoices => Set<ItemInvoice>();
    public DbSet<ClientPayment> ClientPayments => Set<ClientPayment>();

    public DbSet<SiteMedia> SiteMedias => Set<SiteMedia>();
    public DbSet<BOQItemNote> BOQItemNotes => Set<BOQItemNote>();
    public DbSet<BOQProfitabilityLog> BOQProfitabilityLogs => Set<BOQProfitabilityLog>();
    public DbSet<EscalationLog> EscalationLogs => Set<EscalationLog>();

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
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 2. CompanySettings (singleton – Id = 1)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<CompanySettings>()
            .HasKey(cs => cs.Id);
        modelBuilder.Entity<CompanySettings>()
            .HasIndex(cs => cs.Id)
            .IsUnique();

        // ────────────────────────────────────────────────────────────────
        // 3. Project ↔ BOQItem (1:N)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<BOQItem>()
            .HasOne(bi => bi.Project)
            .WithMany(p => p.BOQItems)
            .HasForeignKey(bi => bi.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        // ────────────────────────────────────────────────────────────────
        // 4. BOQItem ↔ Measured / Supervision (1:1 – shared PK)
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
        // 5. User ↔ UserRole (many-to-many)
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
        // 6. ProjectTeamMember ↔ ProjectTeamRole (many-to-many bridge)
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
        // 7. ProjectTeamMember relationships
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
        // 8. Explicit configuration for ItemDailyLog ↔ User
        //    Prevents shadow properties (UserId1) and resolves ambiguity
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ItemDailyLog>()
            .HasOne(dl => dl.CreatedByUser)
            .WithMany(u => u.CreatedDailyLogs)   // ← inverse navigation collection
            .HasForeignKey(dl => dl.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(true);

        modelBuilder.Entity<ItemDailyLog>()
            .HasOne(dl => dl.ClosedByUser)
            .WithMany(u => u.ClosedDailyLogs)    // ← inverse navigation collection
            .HasForeignKey(dl => dl.ClosedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // ────────────────────────────────────────────────────────────────
        // 9. Project children – Restrict to avoid cascade cycles
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ClientPayment>()
            .HasOne(cp => cp.Project)
            .WithMany(p => p.ClientPayments)
            .HasForeignKey(cp => cp.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

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
        // 10. BOQItem children – Cascade safe here
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
        // 11. Other User relationships
        // ────────────────────────────────────────────────────────────────
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
        // 12. Notifications
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 13. Global: Role ↔ Permission
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<RolePermission>()
            .ToTable("RolePermissions")
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Role)
            .WithMany(r => r.Permissions)
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 14. Project-specific: ProjectRole ↔ Permission
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ProjectRolePermission>()
            .ToTable("ProjectRolePermissions")
            .HasKey(prp => new { prp.ProjectRoleId, prp.PermissionId });

        modelBuilder.Entity<ProjectRolePermission>()
            .HasOne(prp => prp.ProjectRole)
            .WithMany(pr => pr.Permissions)
            .HasForeignKey(prp => prp.ProjectRoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProjectRolePermission>()
            .HasOne(prp => prp.Permission)
            .WithMany(p => p.ProjectRolePermissions)
            .HasForeignKey(prp => prp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 15. ProjectRole → Project
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ProjectRole>()
            .HasOne(pr => pr.Project)
            .WithMany(p => p.ProjectRoles)
            .HasForeignKey(pr => pr.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 16. Global decimal precision (18,2)
        // ────────────────────────────────────────────────────────────────
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetColumnType("decimal(18,2)");
        }

        // ────────────────────────────────────────────────────────────────
        // 17. Useful indexes
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<BOQItem>()
            .HasIndex(b => b.ProjectId);

        modelBuilder.Entity<ItemDailyLog>()
            .HasIndex(d => new { d.BOQItemId, d.LogDate })
            .IsUnique();

        // ────────────────────────────────────────────────────────────────
        // 18. Seed Data – 100% static dates
        // ────────────────────────────────────────────────────────────────
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // ── FIXED DATES – no dynamic calculations whatsoever ────────────────────
        var d20260101 = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var d20251215 = new DateTime(2025, 12, 15, 0, 0, 0, DateTimeKind.Utc);
        var d20251201 = new DateTime(2025, 12, 1, 0, 0, 0, DateTimeKind.Utc);
        var d20251001 = new DateTime(2025, 10, 1, 0, 0, 0, DateTimeKind.Utc);
        var d20260116 = new DateTime(2026, 1, 16, 0, 0, 0, DateTimeKind.Utc);
        var d20260120_1430 = new DateTime(2026, 1, 20, 14, 30, 0, DateTimeKind.Utc);
        var d20260630 = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc);

        // Permissions
        modelBuilder.Entity<Permission>().HasData(
            new Permission { Id = 1, Name = "Project.Edit", Description = "تعديل بيانات المشروع", CreatedAt = d20260101 },
            new Permission { Id = 2, Name = "Project.Close", Description = "إغلاق/إنهاء المشروع", CreatedAt = d20260101 },
            new Permission { Id = 3, Name = "Financials.View", Description = "عرض الملخص المالي", CreatedAt = d20260101 },
            new Permission { Id = 4, Name = "Transaction.Add", Description = "إضافة معاملة مالية", CreatedAt = d20260101 },
            new Permission { Id = 5, Name = "Transaction.Review", Description = "مراجعة/اعتماد المعاملات", CreatedAt = d20260101 },
            new Permission { Id = 6, Name = "Media.Review", Description = "مراجعة الصور والفيديوهات", CreatedAt = d20260101 },
            new Permission { Id = 7, Name = "DailyLog.Close", Description = "إغلاق السجل اليومي", CreatedAt = d20260101 },
            new Permission { Id = 8, Name = "Invoice.Approve", Description = "اعتماد الفواتير", CreatedAt = d20260101 },
            new Permission { Id = 9, Name = "Settings.Manage", Description = "تعديل إعدادات المشروع", CreatedAt = d20260101 },
            new Permission { Id = 10, Name = "Users.Manage", Description = "إدارة المستخدمين (عالمي)", CreatedAt = d20260101 }
        );

        // Global Roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "SuperAdmin", Description = "مدير النظام الكلي – كل الصلاحيات", CreatedAt = d20260101 },
            new Role { Id = 2, Name = "CompanyAdmin", Description = "مدير الشركة – إدارة مستخدمين ومشاريع", CreatedAt = d20260101 },
            new Role { Id = 3, Name = "Viewer", Description = "مشاهد فقط – لا تعديل", CreatedAt = d20260101 }
        );

        // Users
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, FullName = "Super Admin", Email = "super@company.com", PasswordHash = "hashed_super123", CreatedAt = d20260101 },
            new User { Id = 2, FullName = "Company Admin", Email = "admin@company.com", PasswordHash = "hashed_admin123", CreatedAt = d20260101 },
            new User { Id = 3, FullName = "Ahmed – Project Manager 1", Email = "ahmed.pm1@demo.com", PasswordHash = "hashed_pm123", CreatedAt = d20260101 },
            new User { Id = 4, FullName = "Mohamed – Site Engineer", Email = "mohamed.engineer@demo.com", PasswordHash = "hashed_eng123", CreatedAt = d20260101 },
            new User { Id = 5, FullName = "Sara – Financial Reviewer", Email = "sara.reviewer@demo.com", PasswordHash = "hashed_rev123", CreatedAt = d20260101 },
            new User { Id = 6, FullName = "Project Manager 2", Email = "pm2@demo.com", PasswordHash = "hashed_pm223", CreatedAt = d20260101 }
        );

        // Global roles assignment
        modelBuilder.Entity<UserRole>().HasData(
            new UserRole { UserId = 1, RoleId = 1, AssignedAt = d20260101 },
            new UserRole { UserId = 2, RoleId = 2, AssignedAt = d20260101 },
            new UserRole { UserId = 3, RoleId = 3, AssignedAt = d20260101 },
            new UserRole { UserId = 6, RoleId = 3, AssignedAt = d20260101 }
        );

        // Global Role ↔ Permission
        modelBuilder.Entity<RolePermission>().HasData(
            new RolePermission { RoleId = 1, PermissionId = 10 },
            new RolePermission { RoleId = 1, PermissionId = 9 },
            new RolePermission { RoleId = 1, PermissionId = 3 },
            new RolePermission { RoleId = 2, PermissionId = 9 },
            new RolePermission { RoleId = 2, PermissionId = 3 }
        );

        // CompanySettings
        modelBuilder.Entity<CompanySettings>().HasData(
            new CompanySettings
            {
                Id = 1,
                EnableDelayNotification = true,
                DelayNotificationIsOneTimeOnly = false,
                DelayNotificationIntervalDays = 7,
                DelayNotificationSendEmail = true,
                DelayGracePeriodDays = 5,
                EnablePhotoUpload = true,
                RequirePhotoReview = true,
                PhotoApproverRole = "مراجع فني",
                EnableInvoiceReview = true,
                EnableInvoiceAggregation = true,
                MaxPhotosPerUpload = 15,
                CreatedAt = d20260101
            }
        );

        // Projects – fixed dates
        modelBuilder.Entity<Project>().HasData(
            new Project
            {
                Id = 1,
                ProjectName = "فيلا القاهرة الجديدة – التجريبي",
                Description = "مشروع سكني لاختبار كامل النظام",
                StartDate = d20251001,
                EndDate = d20260630,
                Status = "جاري",
                OwnerUserId = 1,
                GeneralManagerUserId = 3,
                AccountingSystem = "Mixed",
                TotalContractValue = 12000000m,
                CreatedAt = d20260101
            },
            new Project
            {
                Id = 2,
                ProjectName = "مبنى إداري – مدينة نصر",
                Description = "مشروع تجاري لاختبار تعدد المشاريع",
                StartDate = d20251201,
                Status = "جديد",
                OwnerUserId = 2,
                GeneralManagerUserId = 6,
                AccountingSystem = "Measured",
                TotalContractValue = 8500000m,
                CreatedAt = d20260101
            }
        );

        // ProjectSettings
        modelBuilder.Entity<ProjectSettings>().HasData(
            new ProjectSettings
            {
                Id = 1,
                EnableDelayNotification = true,
                DelayNotificationIntervalDays = 5,
                RequirePhotoReview = true,
                PhotoApproverRole = "مراجع فني",
                MaxPhotosPerUpload = 20,
                CreatedAt = d20260101
            },
            new ProjectSettings
            {
                Id = 2,
                EnableDelayNotification = false,
                EnablePhotoUpload = true,
                RequirePhotoReview = false,
                CreatedAt = d20260101
            }
        );

        // ProjectRoles
        modelBuilder.Entity<ProjectRole>().HasData(
            new ProjectRole { Id = 1, ProjectId = 1, Name = "مدير المشروع", Description = "كل الصلاحيات", CreatedAt = d20260101 },
            new ProjectRole { Id = 2, ProjectId = 1, Name = "مهندس ميداني", Description = "رفع وسجل يومي", CreatedAt = d20260101 },
            new ProjectRole { Id = 3, ProjectId = 1, Name = "مراجع فني", Description = "مراجعة فقط", CreatedAt = d20260101 },
            new ProjectRole { Id = 4, ProjectId = 2, Name = "مدير المشروع 2", Description = "كل الصلاحيات", CreatedAt = d20260101 },
            new ProjectRole { Id = 5, ProjectId = 2, Name = "محاسب", Description = "إدارة معاملات وفواتير", CreatedAt = d20260101 }
        );

        // ProjectRole ↔ Permission
        modelBuilder.Entity<ProjectRolePermission>().HasData(
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 1 },
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 2 },
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 3 },
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 4 },
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 5 },
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 6 },
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 7 },
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 8 },
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 9 },
            new ProjectRolePermission { ProjectRoleId = 2, PermissionId = 4 },
            new ProjectRolePermission { ProjectRoleId = 2, PermissionId = 6 },
            new ProjectRolePermission { ProjectRoleId = 2, PermissionId = 7 },
            new ProjectRolePermission { ProjectRoleId = 3, PermissionId = 5 },
            new ProjectRolePermission { ProjectRoleId = 3, PermissionId = 6 },
            new ProjectRolePermission { ProjectRoleId = 3, PermissionId = 8 },
            new ProjectRolePermission { ProjectRoleId = 4, PermissionId = 1 },
            new ProjectRolePermission { ProjectRoleId = 4, PermissionId = 2 },
            new ProjectRolePermission { ProjectRoleId = 4, PermissionId = 3 },
            new ProjectRolePermission { ProjectRoleId = 4, PermissionId = 4 },
            new ProjectRolePermission { ProjectRoleId = 4, PermissionId = 5 },
            new ProjectRolePermission { ProjectRoleId = 4, PermissionId = 6 },
            new ProjectRolePermission { ProjectRoleId = 4, PermissionId = 7 },
            new ProjectRolePermission { ProjectRoleId = 4, PermissionId = 8 },
            new ProjectRolePermission { ProjectRoleId = 4, PermissionId = 9 },
            new ProjectRolePermission { ProjectRoleId = 5, PermissionId = 3 },
            new ProjectRolePermission { ProjectRoleId = 5, PermissionId = 4 },
            new ProjectRolePermission { ProjectRoleId = 5, PermissionId = 5 },
            new ProjectRolePermission { ProjectRoleId = 5, PermissionId = 8 }
        );

        // ProjectTeamMember
        modelBuilder.Entity<ProjectTeamMember>().HasData(
            new ProjectTeamMember { Id = 1, ProjectId = 1, UserId = 3, ReportsToUserId = null, CreatedAt = d20260101 },
            new ProjectTeamMember { Id = 2, ProjectId = 1, UserId = 4, ReportsToUserId = 3, CreatedAt = d20260101 },
            new ProjectTeamMember { Id = 3, ProjectId = 1, UserId = 5, ReportsToUserId = 3, CreatedAt = d20260101 },
            new ProjectTeamMember { Id = 4, ProjectId = 2, UserId = 6, ReportsToUserId = null, CreatedAt = d20260101 }
        );

        // ProjectTeamRole
        modelBuilder.Entity<ProjectTeamRole>().HasData(
            new ProjectTeamRole { ProjectTeamMemberId = 1, ProjectRoleId = 1, AssignedAt = d20260101 },
            new ProjectTeamRole { ProjectTeamMemberId = 2, ProjectRoleId = 2, AssignedAt = d20260101 },
            new ProjectTeamRole { ProjectTeamMemberId = 3, ProjectRoleId = 3, AssignedAt = d20260101 },
            new ProjectTeamRole { ProjectTeamMemberId = 4, ProjectRoleId = 4, AssignedAt = d20260101 }
        );

        // BOQ Items
        modelBuilder.Entity<BOQItem>().HasData(
            new BOQItem { Id = 1, ProjectId = 1, ItemCode = "A-01", ItemName = "حفر أساسات", Unit = "م³", AccountingType = "Measured", Status = "جاري", StartDate = d20251001, EndDate = d20260116, CreatedAt = d20260101 },
            new BOQItem { Id = 2, ProjectId = 1, ItemCode = "B-02", ItemName = "صب خرسانة أساسات", Unit = "م³", AccountingType = "Measured", Status = "جديد", CreatedAt = d20260101 },
            new BOQItem { Id = 3, ProjectId = 1, ItemCode = "C-01", ItemName = "إشراف عام", AccountingType = "Supervision", Status = "جاري", CreatedAt = d20260101 },
            new BOQItem { Id = 4, ProjectId = 2, ItemCode = "X-01", ItemName = "بناء هيكل", Unit = "م²", AccountingType = "Measured", Status = "جاري", CreatedAt = d20260101 }
        );

        modelBuilder.Entity<BOQMeasured>().HasData(
            new BOQMeasured { Id = 1, AgreedQuantity = 1200m, UnitPrice = 450m, ExecutedQuantity = 600m, CreatedAt = d20260101 },
            new BOQMeasured { Id = 2, AgreedQuantity = 800m, UnitPrice = 1850m, ExecutedQuantity = 0m, CreatedAt = d20260101 },
            new BOQMeasured { Id = 4, AgreedQuantity = 5000m, UnitPrice = 320m, ExecutedQuantity = 1200m, CreatedAt = d20260101 }
        );

        modelBuilder.Entity<BOQSupervision>().HasData(
            new BOQSupervision { Id = 3, SupervisionPercentage = 8.5m, BaseCalculation = "AllProjectInvoices", EstimatedTotalCost = 1020000m, CreatedAt = d20260101 }
        );

        // Transactions
        modelBuilder.Entity<Transaction>().HasData(
            new Transaction { Id = 1, ProjectId = 1, BOQItemId = 1, Amount = 150000m, CreatedByUserId = 4, Status = TransactionStatus.Approved, CreatedAt = d20260101 },
            new Transaction { Id = 2, ProjectId = 1, BOQItemId = 1, Amount = 80000m, CreatedByUserId = 4, Status = TransactionStatus.Pending, CreatedAt = d20251215 },
            new Transaction { Id = 3, ProjectId = 2, BOQItemId = 4, Amount = 400000m, CreatedByUserId = 6, Status = TransactionStatus.Approved, CreatedAt = d20260101 }
        );

        // ItemInvoices
        modelBuilder.Entity<ItemInvoice>().HasData(
            new ItemInvoice { Id = 1, ProjectId = 1, BOQItemId = 1, Amount = 120000m, Status = "Pending", ReviewerUserId = null, CreatedAt = d20260101 },
            new ItemInvoice { Id = 2, ProjectId = 1, BOQItemId = 2, Amount = 300000m, Status = "Approved", ReviewerUserId = 5, CreatedAt = d20251201 }
        );

        // ClientPayments
        modelBuilder.Entity<ClientPayment>().HasData(
            new ClientPayment { Id = 1, ProjectId = 1, Amount = 2000000m, IsConfirmed = true, CreatedAt = d20260101 },
            new ClientPayment { Id = 2, ProjectId = 2, Amount = 1000000m, IsConfirmed = false, CreatedAt = d20251215 }
        );

        // SiteMedias
        modelBuilder.Entity<SiteMedia>().HasData(
            new SiteMedia { Id = 1, ProjectId = 1, BOQItemId = 1, UploaderUserId = 4, MediaType = "Photo", Status = "Pending", CreatedAt = d20260101 },
            new SiteMedia { Id = 2, ProjectId = 1, BOQItemId = 1, UploaderUserId = 4, ReviewerUserId = 5, MediaType = "Video", Status = "Approved", CreatedAt = d20251201 }
        );

        // EscalationLogs
        modelBuilder.Entity<EscalationLog>().HasData(
            new EscalationLog { Id = 1, ProjectId = 1, BOQItemId = 2, RecipientUserId = 3, EscalationType = "ItemStartDelay", SentAt = d20251215, CreatedAt = d20260101 }
        );

        // Notifications
        modelBuilder.Entity<Notification>().HasData(
            new Notification { Id = 1, UserId = 3, Title = "تحذير تأخير", Message = "البند B-02 متأخر", Type = NotificationType.ProjectDelay, CreatedAt = d20260101 },
            new Notification { Id = 2, UserId = 5, Title = "مراجعة وسائط", Message = "صورة/فيديو جديد يحتاج مراجعة", Type = NotificationType.MediaReview, CreatedAt = d20260120_1430 }
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
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
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