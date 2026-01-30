using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ConstructionManagement.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    private readonly ITenantContext _tenantContext;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ITenantContext tenantContext = null)
        : base(options)
    {
        _tenantContext = tenantContext;
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

        // 1. Composite / Junction Table Keys
        modelBuilder.Entity<UserRole>().HasKey(ur => new { ur.UserId, ur.RoleId });
        modelBuilder.Entity<RolePermission>().HasKey(rp => new { rp.RoleId, rp.PermissionId });
        modelBuilder.Entity<ProjectRolePermission>().HasKey(prp => new { prp.ProjectRoleId, prp.PermissionId });
        modelBuilder.Entity<ProjectTeamRole>().HasKey(ptr => new { ptr.ProjectTeamMemberId, ptr.ProjectRoleId });
        modelBuilder.Entity<ProjectTeamMember>().HasIndex(ptm => new { ptm.ProjectId, ptm.UserId }).IsUnique();

        // 2. 1:1 Relationships with Shared Primary Key
        modelBuilder.Entity<ProjectSettings>().HasKey(ps => ps.Id);
        modelBuilder.Entity<ProjectSettings>().HasOne(ps => ps.Project).WithOne(p => p.Settings).HasForeignKey<ProjectSettings>(ps => ps.Id).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BOQMeasured>().HasKey(m => m.Id);
        modelBuilder.Entity<BOQMeasured>().HasOne(m => m.Item).WithOne(i => i.MeasuredData).HasForeignKey<BOQMeasured>(m => m.Id).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BOQSupervision>().HasKey(s => s.Id);
        modelBuilder.Entity<BOQSupervision>().HasOne(s => s.Item).WithOne(i => i.SupervisionData).HasForeignKey<BOQSupervision>(s => s.Id).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BOQExecutedDelta>().HasIndex(d => d.BOQItemId);
        modelBuilder.Entity<BOQExecutedDelta>().HasIndex(d => d.ProcessedAt);

        // 3. InvoiceSequence & Constraints
        modelBuilder.Entity<InvoiceSequence>().ToTable("InvoiceSequences").HasKey(s => s.YearPart);
        modelBuilder.Entity<InvoiceSequence>().Property(s => s.NextNumber).HasDefaultValue(1);
        modelBuilder.Entity<ItemInvoice>().HasIndex(ii => ii.InvoiceNumber).IsUnique().HasDatabaseName("IX_ItemInvoice_InvoiceNumber_Unique");

        // 4. Critical Relationships (NoAction to prevent cascade conflicts)
        modelBuilder.Entity<BOQItem>().HasOne(b => b.Project).WithMany(p => p.BOQItems).HasForeignKey(b => b.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ApprovalRequest>().HasOne(ar => ar.Project).WithMany().HasForeignKey(ar => ar.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ApprovalRequest>().HasOne(ar => ar.BOQItem).WithMany().HasForeignKey(ar => ar.BOQItemId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<ApprovalRequest>().HasOne(ar => ar.ApprovalRule).WithMany(r => r.ApprovalRequests).HasForeignKey(ar => ar.ProjectApprovalRuleId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SiteMedia>().HasOne(sm => sm.Project).WithMany(p => p.SiteMedias).HasForeignKey(sm => sm.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemInvoice>().HasOne(ii => ii.Project).WithMany(p => p.ItemInvoices).HasForeignKey(ii => ii.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EscalationLog>().HasOne(el => el.Project).WithMany(p => p.EscalationLogs).HasForeignKey(el => el.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ClientPayment>().HasOne(cp => cp.Project).WithMany(p => p.ClientPayments).HasForeignKey(cp => cp.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ProjectTeamRole>().HasOne(ptr => ptr.ProjectTeamMember).WithMany(ptm => ptm.ProjectTeamRoles).HasForeignKey(ptr => ptr.ProjectTeamMemberId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ProjectTeamRole>().HasOne(ptr => ptr.ProjectRole).WithMany(pr => pr.Assignments).HasForeignKey(ptr => ptr.ProjectRoleId).OnDelete(DeleteBehavior.NoAction);

        // 5. User-related relationships (NoAction)
        modelBuilder.Entity<ItemDailyLog>().HasOne(dl => dl.CreatedByUser).WithMany().HasForeignKey(dl => dl.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemDailyLog>().HasOne(dl => dl.ClosedByUser).WithMany().HasForeignKey(dl => dl.ClosedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemInvoice>().HasOne(ii => ii.CreatedBy).WithMany().HasForeignKey(ii => ii.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemInvoice>().HasOne(ii => ii.Reviewer).WithMany().HasForeignKey(ii => ii.ReviewerUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Project>().HasOne(p => p.Owner).WithMany().HasForeignKey(p => p.OwnerUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Project>().HasOne(p => p.GeneralManager).WithMany().HasForeignKey(p => p.GeneralManagerUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Project>().HasOne(p => p.ClosedBy).WithMany().HasForeignKey(p => p.ClosedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SiteMedia>().HasOne(sm => sm.Uploader).WithMany().HasForeignKey(sm => sm.UploaderUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SiteMedia>().HasOne(sm => sm.Reviewer).WithMany().HasForeignKey(sm => sm.ReviewerUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Transaction>().HasOne(t => t.CreatedBy).WithMany().HasForeignKey(t => t.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Transaction>().HasOne(t => t.ReviewedBy).WithMany().HasForeignKey(t => t.ReviewedByUserId).OnDelete(DeleteBehavior.NoAction);

        // 6. Reporting Hierarchy
        modelBuilder.Entity<ProjectTeamMember>().HasOne(ptm => ptm.ReportsTo).WithMany(u => u.Subordinates).HasForeignKey(ptm => ptm.ReportsToUserId).OnDelete(DeleteBehavior.NoAction);

        // 7. Safe Cascade on Child Entities
        modelBuilder.Entity<ApprovalStep>().HasOne(step => step.Request).WithMany(req => req.Steps).HasForeignKey(step => step.ApprovalRequestId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<BOQProfitabilityLog>().HasOne(pl => pl.BOQItem).WithMany(b => b.ProfitabilityLogs).HasForeignKey(pl => pl.BOQItemId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ItemDailyLog>().HasOne(dl => dl.BOQItem).WithMany(b => b.DailyLogs).HasForeignKey(dl => dl.BOQItemId).OnDelete(DeleteBehavior.Cascade);

        // 8. Performance Indexes
        modelBuilder.Entity<ItemDailyLog>().HasIndex(dl => new { dl.BOQItemId, dl.LogDate }).IsUnique();
        modelBuilder.Entity<SiteMedia>().HasIndex(sm => sm.ProjectId);
        modelBuilder.Entity<Notification>().HasIndex(n => n.UserId);

        // 9. Precision
        foreach (var property in modelBuilder.Model.GetEntityTypes().SelectMany(t => t.GetProperties()).Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetColumnType("decimal(18,2)");
        }

        // 10. SEEDING
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        var fixedDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // --- Packages ---
        modelBuilder.Entity<Package>().HasData(
            new Package { Id = 1, Name = "Free", Description = "Starter plan", Price = 0, MaxTeamMembers = 5, MaxBOQItems = 50, CreatedAt = fixedDate },
            new Package { Id = 2, Name = "Pro", Description = "Professional tracking", Price = 1500, MaxTeamMembers = 20, MaxBOQItems = 200, CreatedAt = fixedDate },
            new Package { Id = 3, Name = "Premium", Description = "Full enterprise features", Price = 5000, MaxTeamMembers = 100, MaxBOQItems = 1000, AllowAIAssistance = true, CreatedAt = fixedDate }
        );

        // --- Projects ---
        modelBuilder.Entity<Project>().HasData(
            new Project { Id = 1, ProjectName = "Al-Massa Tower", AccountingSystem = "Measured", Status = "InProgress", OwnerUserId = 1, CreatedAt = fixedDate },
            new Project { Id = 2, ProjectName = "Coastal Supervision", AccountingSystem = "Supervision", Status = "جديد", OwnerUserId = 1, CreatedAt = fixedDate },
            new Project { Id = 3, ProjectName = "Smart Mall Mixed", AccountingSystem = "Mixed", Status = "InProgress", OwnerUserId = 1, CreatedAt = fixedDate }
        );

        // --- BOQ Items (Parent Items) ---
        modelBuilder.Entity<BOQItem>().HasData(
            // Measured Items
            new BOQItem { Id = 101, ProjectId = 1, ItemCode = "CIV-01", ItemName = "Excavation", AccountingType = "Measured", Status = "InProgress", CreatedAt = fixedDate },
            new BOQItem { Id = 102, ProjectId = 1, ItemCode = "CIV-02", ItemName = "Concrete Base", AccountingType = "Measured", Status = "جديد", CreatedAt = fixedDate },
            // Supervision Items
            new BOQItem { Id = 201, ProjectId = 2, ItemCode = "SUP-01", ItemName = "Structural Audit", AccountingType = "Supervision", Status = "جديد", CreatedAt = fixedDate },
            // Mixed Item
            new BOQItem { Id = 301, ProjectId = 3, ItemCode = "MIX-01", ItemName = "MEP Installation", AccountingType = "Mixed", Status = "InProgress", CreatedAt = fixedDate }
        );

        // --- 1:1 Dependent Data (BOQMeasured / BOQSupervision) ---
        modelBuilder.Entity<BOQMeasured>().HasData(
            new BOQMeasured { Id = 101, AgreedQuantity = 5000, UnitPrice = 150, ExecutedQuantity = 1200, CreatedAt = fixedDate },
            new BOQMeasured { Id = 102, AgreedQuantity = 800, UnitPrice = 4200, ExecutedQuantity = 0, CreatedAt = fixedDate },
            new BOQMeasured { Id = 301, AgreedQuantity = 1, UnitPrice = 500000, ExecutedQuantity = 0.25m, CreatedAt = fixedDate } // Part of Mixed
        );

        modelBuilder.Entity<BOQSupervision>().HasData(
            new BOQSupervision { Id = 201, SupervisionPercentage = 5.0m, BaseCalculation = "AllProjectInvoices", EstimatedTotalCost = 25000, CreatedAt = fixedDate },
            new BOQSupervision { Id = 301, SupervisionPercentage = 2.5m, BaseCalculation = "ThisItemInvoices", EstimatedTotalCost = 12500, CreatedAt = fixedDate } // Part of Mixed
        );
    }

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

        if (!string.IsNullOrEmpty(_tenantContext.TenantId))
        {
            var connectionString = optionsBuilder.Options.FindExtension<Microsoft.EntityFrameworkCore.SqlServer.Infrastructure.Internal.SqlServerOptionsExtension>()?.ConnectionString;

            if (!string.IsNullOrEmpty(connectionString))
            {
                var builder = new SqlConnectionStringBuilder(connectionString)
                {
                    InitialCatalog = _tenantContext.TenantId
                };
                optionsBuilder.UseSqlServer(builder.ConnectionString);
            }
        }
    }
}