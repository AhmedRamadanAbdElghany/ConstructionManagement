using ConstructionManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

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
    public DbSet<ProjectTeamMember> ProjectTeamMembers => Set<ProjectTeamMember>();
    public DbSet<ProjectTeamRole> ProjectTeamRoles => Set<ProjectTeamRole>();
    public DbSet<ProjectRole> ProjectRoles => Set<ProjectRole>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<ProjectSettings> ProjectSettings => Set<ProjectSettings>();
    public DbSet<ProjectApprovalRule> ProjectApprovalRules => Set<ProjectApprovalRule>();
    public DbSet<CompanySettings> CompanySettings => Set<CompanySettings>();
    public DbSet<BOQItem> BOQItems => Set<BOQItem>();
    public DbSet<BOQMeasured> BOQMeasured => Set<BOQMeasured>();
    public DbSet<BOQExecutedDelta> BOQExecutedDeltas => Set<BOQExecutedDelta>();
    public DbSet<BOQSupervision> BOQSupervision => Set<BOQSupervision>();
    public DbSet<ItemDailyLog> ItemDailyLogs => Set<ItemDailyLog>();
    public DbSet<ItemInvoice> ItemInvoices => Set<ItemInvoice>();
    public DbSet<ClientPayment> ClientPayments => Set<ClientPayment>();
    public DbSet<SiteMedia> SiteMedias => Set<SiteMedia>();
    public DbSet<BOQItemNote> BOQItemNotes => Set<BOQItemNote>();
    public DbSet<BOQProfitabilityLog> BOQProfitabilityLogs => Set<BOQProfitabilityLog>();
    public DbSet<EscalationLog> EscalationLogs => Set<EscalationLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<ApprovalRequest> ApprovalRequests => Set<ApprovalRequest>();
    public DbSet<ApprovalStep> ApprovalSteps => Set<ApprovalStep>();
    public DbSet<InvoiceSequence> InvoiceSequences => Set<InvoiceSequence>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ────────────────────────────────────────────────────────────────
        // 1. Composite / Junction Table Keys
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        modelBuilder.Entity<ProjectRolePermission>()
            .HasKey(prp => new { prp.ProjectRoleId, prp.PermissionId });

        modelBuilder.Entity<ProjectTeamRole>()
            .HasKey(ptr => new { ptr.ProjectTeamMemberId, ptr.ProjectRoleId });

        // Unique constraint: one membership per user per project
        modelBuilder.Entity<ProjectTeamMember>()
            .HasIndex(ptm => new { ptm.ProjectId, ptm.UserId })
            .IsUnique();

        // ────────────────────────────────────────────────────────────────
        // 2. 1:1 Relationships with Shared Primary Key
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ProjectSettings>()
            .HasKey(ps => ps.Id);

        modelBuilder.Entity<ProjectSettings>()
            .HasOne(ps => ps.Project)
            .WithOne(p => p.Settings)
            .HasForeignKey<ProjectSettings>(ps => ps.Id)
            .OnDelete(DeleteBehavior.Cascade);

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


        modelBuilder.Entity<BOQExecutedDelta>()
    .HasIndex(d => d.BOQItemId);

        modelBuilder.Entity<BOQExecutedDelta>()
            .HasIndex(d => d.ProcessedAt); // لتسريع الـ job
        // ────────────────────────────────────────────────────────────────
        // 3. InvoiceSequence (year-based sequence)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<InvoiceSequence>()
            .ToTable("InvoiceSequences")
            .HasKey(s => s.YearPart);

        modelBuilder.Entity<InvoiceSequence>()
            .Property(s => s.YearPart)
            .HasColumnName("YearPart");

        modelBuilder.Entity<InvoiceSequence>()
            .Property(s => s.NextNumber)
            .HasDefaultValue(1);

        // Unique invoice number across the system
        modelBuilder.Entity<ItemInvoice>()
            .HasIndex(ii => ii.InvoiceNumber)
            .IsUnique()
            .HasDatabaseName("IX_ItemInvoice_InvoiceNumber_Unique");

        // ────────────────────────────────────────────────────────────────
        // 4. Critical Relationships – NoAction to prevent cascade conflicts
        // ────────────────────────────────────────────────────────────────

        // Project → BOQItem
        modelBuilder.Entity<BOQItem>()
            .HasOne(b => b.Project)
            .WithMany(p => p.BOQItems)
            .HasForeignKey(b => b.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);

        // Project → ApprovalRequest
        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(ar => ar.Project)
            .WithMany() // Add ICollection<ApprovalRequest> ApprovalRequests to Project if needed
            .HasForeignKey(ar => ar.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);

        // ApprovalRequest → BOQItem (optional)
        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(ar => ar.BOQItem)
            .WithMany()
            .HasForeignKey(ar => ar.BOQItemId)
            .OnDelete(DeleteBehavior.SetNull);

        // ApprovalRequest → ProjectApprovalRule
        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(ar => ar.ApprovalRule)
            .WithMany(r => r.ApprovalRequests)
            .HasForeignKey(ar => ar.ProjectApprovalRuleId)
            .OnDelete(DeleteBehavior.NoAction);

        // Project → SiteMedia
        modelBuilder.Entity<SiteMedia>()
            .HasOne(sm => sm.Project)
            .WithMany(p => p.SiteMedias)
            .HasForeignKey(sm => sm.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);

        // Project → ItemInvoice
        modelBuilder.Entity<ItemInvoice>()
            .HasOne(ii => ii.Project)
            .WithMany(p => p.ItemInvoices)
            .HasForeignKey(ii => ii.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);

        // Project → EscalationLog
        modelBuilder.Entity<EscalationLog>()
            .HasOne(el => el.Project)
            .WithMany(p => p.EscalationLogs)
            .HasForeignKey(el => el.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);

        // Project → ClientPayment
        modelBuilder.Entity<ClientPayment>()
            .HasOne(cp => cp.Project)
            .WithMany(p => p.ClientPayments)
            .HasForeignKey(cp => cp.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);


        // ClientPayment → ConfirmedBy (optional user who confirmed)
        modelBuilder.Entity<ClientPayment>()
            .HasOne(p => p.ConfirmedBy)
            .WithMany()                           // or .WithMany(u => u.ConfirmedPayments) if you add collection to User
            .HasForeignKey(p => p.ConfirmedByUserId)
            .OnDelete(DeleteBehavior.Restrict);   // prevent deleting user if they confirmed payments


        // ProjectTeamRoles bridge table – both sides NoAction
        modelBuilder.Entity<ProjectTeamRole>()
            .HasOne(ptr => ptr.ProjectTeamMember)
            .WithMany(ptm => ptm.ProjectTeamRoles)
            .HasForeignKey(ptr => ptr.ProjectTeamMemberId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ProjectTeamRole>()
            .HasOne(ptr => ptr.ProjectRole)
            .WithMany(pr => pr.Assignments)
            .HasForeignKey(ptr => ptr.ProjectRoleId)
            .OnDelete(DeleteBehavior.NoAction);

        // ────────────────────────────────────────────────────────────────
        // 5. User-related relationships (Restrict / NoAction)
        // ────────────────────────────────────────────────────────────────

        // ItemDailyLog → CreatedBy / ClosedBy
        modelBuilder.Entity<ItemDailyLog>()
            .HasOne(dl => dl.CreatedByUser)
            .WithMany()
            .HasForeignKey(dl => dl.CreatedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ItemDailyLog>()
            .HasOne(dl => dl.ClosedByUser)
            .WithMany()
            .HasForeignKey(dl => dl.ClosedByUserId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        // ItemInvoice → CreatedBy / Reviewer
        modelBuilder.Entity<ItemInvoice>()
            .HasOne(ii => ii.CreatedBy)
            .WithMany()
            .HasForeignKey(ii => ii.CreatedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ItemInvoice>()
            .HasOne(ii => ii.Reviewer)
            .WithMany()
            .HasForeignKey(ii => ii.ReviewerUserId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        // Project → Owner / GeneralManager / ClosedBy
        modelBuilder.Entity<Project>()
            .HasOne(p => p.Owner)
            .WithMany()
            .HasForeignKey(p => p.OwnerUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Project>()
            .HasOne(p => p.GeneralManager)
            .WithMany()
            .HasForeignKey(p => p.GeneralManagerUserId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        modelBuilder.Entity<Project>()
            .HasOne(p => p.ClosedBy)
            .WithMany()
            .HasForeignKey(p => p.ClosedByUserId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        // SiteMedia → Uploader / Reviewer
        modelBuilder.Entity<SiteMedia>()
            .HasOne(sm => sm.Uploader)
            .WithMany()
            .HasForeignKey(sm => sm.UploaderUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<SiteMedia>()
            .HasOne(sm => sm.Reviewer)
            .WithMany()
            .HasForeignKey(sm => sm.ReviewerUserId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        // Transaction → CreatedBy / ReviewedBy
        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.CreatedBy)
            .WithMany()
            .HasForeignKey(t => t.CreatedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.ReviewedBy)
            .WithMany()
            .HasForeignKey(t => t.ReviewedByUserId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        // ────────────────────────────────────────────────────────────────
        // 6. Reporting Hierarchy (ProjectTeamMember → User)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ProjectTeamMember>()
            .HasOne(ptm => ptm.ReportsTo)
            .WithMany(u => u.Subordinates)
            .HasForeignKey(ptm => ptm.ReportsToUserId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        // ────────────────────────────────────────────────────────────────
        // 7. Safe Cascade on Child Entities
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ApprovalStep>()
            .HasOne(step => step.Request)
            .WithMany(req => req.Steps)
            .HasForeignKey(step => step.ApprovalRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BOQProfitabilityLog>()
            .HasOne(pl => pl.BOQItem)
            .WithMany(b => b.ProfitabilityLogs)
            .HasForeignKey(pl => pl.BOQItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ItemDailyLog>()
            .HasOne(dl => dl.BOQItem)
            .WithMany(b => b.DailyLogs)
            .HasForeignKey(dl => dl.BOQItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 8. Indexes for Performance & Integrity
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ItemDailyLog>()
            .HasIndex(dl => new { dl.BOQItemId, dl.LogDate })
            .IsUnique();

        modelBuilder.Entity<SiteMedia>()
            .HasIndex(sm => sm.ProjectId);

        modelBuilder.Entity<Notification>()
            .HasIndex(n => n.UserId);

        modelBuilder.Entity<EscalationLog>()
            .HasIndex(el => el.ProjectId);

        modelBuilder.Entity<ItemInvoice>()
            .HasIndex(ii => ii.ProjectId);

        modelBuilder.Entity<BOQItem>()
            .HasIndex(b => b.ProjectId);

        modelBuilder.Entity<ApprovalRequest>()
            .HasIndex(ar => ar.ProjectId);

        // ────────────────────────────────────────────────────────────────
        // 9. Global Decimal Precision
        // ────────────────────────────────────────────────────────────────
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetColumnType("decimal(18,2)");
        }

        // ────────────────────────────────────────────────────────────────
        // 10. Seed Data – Use FIXED values only!
        // ────────────────────────────────────────────────────────────────
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        var fixedDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // 1. CompanySettings (singleton – ID = 1)
        modelBuilder.Entity<CompanySettings>().HasData(
            new CompanySettings
            {
                Id = 1,
                EnableDelayNotification = true,
                DelayNotificationIsOneTimeOnly = false,
                DelayNotificationIntervalDays = 7,
                DelayNotificationSendEmail = true,
                DelayGracePeriodDays = 3,
                EnablePhotoUpload = true,
                RequirePhotoReview = true,
                PhotoApproverRole = "MediaReviewer",
                EnableInvoiceReview = true,
                EnableInvoiceAggregation = true,
                MaxPhotosPerUpload = 10,
                CreatedAt = fixedDate,
                UpdatedAt = null
            }
        );

        // 2. Packages
        modelBuilder.Entity<Package>().HasData(
            new Package
            {
                Id = 1,
                Name = "Free",
                Description = "Basic plan",
                Price = 0m,
                MaxTeamMembers = 3,
                MaxDailyPhotos = 10,
                MaxBOQItems = 20,
                AllowAdvancedReports = false,
                AllowCustomBranding = false,
                AllowAIAssistance = false,
                CreatedAt = fixedDate
            },
            new Package
            {
                Id = 2,
                Name = "Pro",
                Description = "Full features",
                Price = 199.99m,
                MaxTeamMembers = 10,
                MaxDailyPhotos = 50,
                MaxBOQItems = 100,
                AllowAdvancedReports = true,
                AllowCustomBranding = true,
                AllowAIAssistance = true,
                CreatedAt = fixedDate
            }
        );

        // 3. Permissions (expanded from your list)
        modelBuilder.Entity<Permission>().HasData(
            new Permission { Id = 1, Name = "Project.Edit", Description = "تعديل بيانات المشروع", CreatedAt = fixedDate },
            new Permission { Id = 2, Name = "Project.Close", Description = "إغلاق المشروع", CreatedAt = fixedDate },
            new Permission { Id = 3, Name = "Financials.View", Description = "عرض الملخص المالي", CreatedAt = fixedDate },
            new Permission { Id = 4, Name = "Transaction.Add", Description = "إضافة معاملة", CreatedAt = fixedDate },
            new Permission { Id = 5, Name = "Transaction.Review", Description = "مراجعة المعاملات", CreatedAt = fixedDate },
            new Permission { Id = 6, Name = "Media.Review", Description = "مراجعة الوسائط", CreatedAt = fixedDate },
            new Permission { Id = 7, Name = "DailyLog.Close", Description = "إغلاق اليومية", CreatedAt = fixedDate },
            new Permission { Id = 8, Name = "Invoice.Approve", Description = "اعتماد الفواتير", CreatedAt = fixedDate },
            new Permission { Id = 9, Name = "Settings.Manage", Description = "إدارة الإعدادات", CreatedAt = fixedDate }
        );

        // 4. Roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "SuperAdmin", Description = "مدير النظام الكلي", CreatedAt = fixedDate },
            new Role { Id = 2, Name = "CompanyAdmin", Description = "مدير الشركة", CreatedAt = fixedDate },
            new Role { Id = 3, Name = "ProjectManager", Description = "مدير مشروع", CreatedAt = fixedDate },
            new Role { Id = 4, Name = "SiteEngineer", Description = "مهندس ميداني", CreatedAt = fixedDate }
        );

        // 5. RolePermissions (assign permissions)
        modelBuilder.Entity<RolePermission>().HasData(
            // SuperAdmin → all
            new RolePermission { RoleId = 1, PermissionId = 1 },
            new RolePermission { RoleId = 1, PermissionId = 2 },
            new RolePermission { RoleId = 1, PermissionId = 3 },
            new RolePermission { RoleId = 1, PermissionId = 4 },
            new RolePermission { RoleId = 1, PermissionId = 5 },
            new RolePermission { RoleId = 1, PermissionId = 6 },
            new RolePermission { RoleId = 1, PermissionId = 7 },
            new RolePermission { RoleId = 1, PermissionId = 8 },
            new RolePermission { RoleId = 1, PermissionId = 9 },

            // ProjectManager → most
            new RolePermission { RoleId = 3, PermissionId = 1 },
            new RolePermission { RoleId = 3, PermissionId = 2 },
            new RolePermission { RoleId = 3, PermissionId = 3 },
            new RolePermission { RoleId = 3, PermissionId = 4 },
            new RolePermission { RoleId = 3, PermissionId = 5 },
            new RolePermission { RoleId = 3, PermissionId = 7 },
            new RolePermission { RoleId = 3, PermissionId = 8 }
        );

        // 6. Users
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                FullName = "Super Admin",
                Email = "superadmin@demo.com",
                PasswordHash = "$2a$11$7r6fX9k2YvQ8mP3nL5tJ2eW9xH4kR8vB2cN6jQ1pT5yU3mW9xK8v", // placeholder BCrypt
                Phone = "0123456789",
                CreatedAt = fixedDate
            },
            new User
            {
                Id = 2,
                FullName = "أحمد مدير المشروع",
                Email = "ahmed.pm@demo.com",
                PasswordHash = "$2a$11$7r6fX9k2YvQ8mP3nL5tJ2eW9xH4kR8vB2cN6jQ1pT5yU3mW9xK8v",
                Phone = "0109876543",
                CreatedAt = fixedDate.AddDays(5)
            },
            new User
            {
                Id = 3,
                FullName = "مهندس ميداني",
                Email = "engineer@demo.com",
                PasswordHash = "$2a$11$7r6fX9k2YvQ8mP3nL5tJ2eW9xH4kR8vB2cN6jQ1pT5yU3mW9xK8v",
                Phone = "0112233445",
                CreatedAt = fixedDate.AddDays(10)
            }
        );

        // 7. UserRoles
        modelBuilder.Entity<UserRole>().HasData(
            new UserRole { UserId = 1, RoleId = 1, AssignedAt = fixedDate }, // SuperAdmin
            new UserRole { UserId = 2, RoleId = 3, AssignedAt = fixedDate.AddDays(5) }, // ProjectManager
            new UserRole { UserId = 3, RoleId = 4, AssignedAt = fixedDate.AddDays(10) } // SiteEngineer
        );

        // 8. One Test Project
        modelBuilder.Entity<Project>().HasData(
            new Project
            {
                Id = 1,
                ProjectName = "مشروع تجريبي - فيلا القاهرة الجديدة",
                Description = "مشروع سكني لاختبار النظام",
                StartDate = fixedDate.AddMonths(-2),
                EndDate = fixedDate.AddMonths(10),
                Status = "جاري",
                OwnerUserId = 1,
                GeneralManagerUserId = 2,
                AccountingSystem = "Mixed",
                TotalContractValue = 8500000m,
                CreatedAt = fixedDate.AddDays(15)
            }
        );

        // 9. ProjectRoles (for the test project)
        modelBuilder.Entity<ProjectRole>().HasData(
            new ProjectRole { Id = 1, ProjectId = 1, Name = "مدير المشروع", Description = "له جميع الصلاحيات", CreatedAt = fixedDate },
            new ProjectRole { Id = 2, ProjectId = 1, Name = "مهندس ميداني", Description = "رفع صور ويوميات", CreatedAt = fixedDate },
            new ProjectRole { Id = 3, ProjectId = 1, Name = "مراجع فني", Description = "مراجعة التقدم", CreatedAt = fixedDate }
        );

        // 10. ProjectTeamMembers
        modelBuilder.Entity<ProjectTeamMember>().HasData(
            new ProjectTeamMember { Id = 1, ProjectId = 1, UserId = 2, ReportsToUserId = null, CreatedAt = fixedDate },
            new ProjectTeamMember { Id = 2, ProjectId = 1, UserId = 3, ReportsToUserId = 2, CreatedAt = fixedDate }
        );

        // 11. ProjectTeamRoles
        modelBuilder.Entity<ProjectTeamRole>().HasData(
            new ProjectTeamRole { ProjectTeamMemberId = 1, ProjectRoleId = 1, AssignedAt = fixedDate },
            new ProjectTeamRole { ProjectTeamMemberId = 2, ProjectRoleId = 2, AssignedAt = fixedDate }
        );

        // 12. ProjectSettings (for project 1)
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
                CreatedAt = fixedDate
            }
        );

        // 13. BOQItems (for project 1)
        modelBuilder.Entity<BOQItem>().HasData(
            new BOQItem
            {
                Id = 1,
                ProjectId = 1,
                ItemCode = "A-01",
                ItemName = "حفر أساسات",
                Unit = "م³",
                AccountingType = "Measured",
                Status = "جاري",
                CreatedAt = fixedDate.AddDays(20)
            },
            new BOQItem
            {
                Id = 2,
                ProjectId = 1,
                ItemCode = "B-02",
                ItemName = "صب خرسانة أساسات",
                Unit = "م³",
                AccountingType = "Measured",
                Status = "جديد",
                CreatedAt = fixedDate.AddDays(20)
            }
        );

        // 14. BOQMeasured (for measured items)
        modelBuilder.Entity<BOQMeasured>().HasData(
            new BOQMeasured
            {
                Id = 1,
                AgreedQuantity = 1200m,
                UnitPrice = 450m,
                ExecutedQuantity = 480m,
                CreatedAt = fixedDate
            },
            new BOQMeasured
            {
                Id = 2,
                AgreedQuantity = 800m,
                UnitPrice = 1850m,
                ExecutedQuantity = 0m,
                CreatedAt = fixedDate
            }
        );
    }

    // ────────────────────────────────────────────────────────────────
    // Audit Logic (unchanged)
    // ────────────────────────────────────────────────────────────────
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
                entry.Entity.CreatedAt = now;

            entry.Entity.UpdatedAt = now;
        }
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
    }
}