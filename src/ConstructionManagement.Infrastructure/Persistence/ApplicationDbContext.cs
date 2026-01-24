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
        // IMPORTANT: Do NOT use DateTime.UtcNow, Guid.NewGuid(), etc. here
        // Example of correct fixed seed:
        // modelBuilder.Entity<Role>().HasData(
        //     new Role 
        //     { 
        //         Id = 1, 
        //         Name = "Admin", 
        //         Description = "Full access", 
        //         CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) 
        //     }
        // );

        // Add your real fixed seed data here...
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